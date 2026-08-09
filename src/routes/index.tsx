import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  builderTitle,
  canvasToBlob,
  loadPhoto,
  renderBadge,
  renderPfp,
} from "@/lib/hhgoa-graphics";
import { countCreated, countVisit, readStats, type LocalStats } from "@/lib/local-stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Frame In Goa — HH Goa 2026 PFP & Builder ID Generator" },
      {
        name: "description",
        content:
          "Upload a photo and instantly get a branded Hacker House Goa 2026 profile picture frame or builder ID card. Download it and share on X with #FrameInGoa.",
      },
      { property: "og:title", content: "Frame In Goa — HH Goa 2026 Graphic Generator" },
      {
        property: "og:description",
        content:
          "Make your HH Goa 2026 PFP frame or builder ID card in seconds. No login, no signup — just upload, download, share.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CAPTION =
  "I'm heading to Hacker House Goa 2026 🌴 4 days. one rhythm. everything intentional. #FrameInGoa";

type Mode = "pfp" | "badge";

function Index() {
  const [mode, setMode] = useState<Mode>("pfp");
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [handle, setHandle] = useState("");
  const [title, setTitle] = useState("");
  const blobRef = useRef<Blob | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<LocalStats>({ visits: 0, created: 0 });

  useEffect(() => {
    setStats(countVisit());
  }, []);

  const seed = (name + role).trim();
  useEffect(() => {
    setTitle((t) => (t ? t : ""));
  }, []);
  const activeTitle = title || builderTitle(seed || "goa") || "Builder";

  const render = useCallback(async () => {
    if (!img) return;
    const canvas =
      mode === "pfp"
        ? renderPfp(img)
        : renderBadge(img, { name, role, handle, title: activeTitle });
    const blob = await canvasToBlob(canvas);
    blobRef.current = blob;
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(blob);
    });
  }, [img, mode, name, role, handle, activeTitle]);

  useEffect(() => {
    let raf = 0;
    if (img) {
      // fonts must be ready or canvas falls back to a default face
      document.fonts.ready.then(() => {
        raf = requestAnimationFrame(() => void render());
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [img, render]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      setImg(await loadPhoto(file));
      if (!name) setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that photo");
    } finally {
      setBusy(false);
    }
  }

  const filename = mode === "pfp" ? "hh-goa-2026-pfp.png" : "hh-goa-2026-builder-id.png";

  function download() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = filename;
    a.click();
    setStats(countCreated());
  }

  async function shareToX() {
    const blob = blobRef.current;
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(CAPTION)}`;
    if (blob && typeof navigator !== "undefined" && "canShare" in navigator) {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: CAPTION });
          return;
        } catch {
          /* user cancelled — fall through */
        }
      }
    }
    download();
    window.open(tweet, "_blank", "noopener");
  }

  return (
    <main className="bg-jungle min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10 sm:pt-16">
        <header className="text-center">
          <p className="font-brand text-xs tracking-[0.35em] text-accent uppercase">
            Hacker House · Goa · 2026
          </p>
          <h1 className="mt-3 text-5xl leading-[0.9] sm:text-7xl">Frame In Goa</h1>
          <p className="font-brand mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Upload a photo, get an on-brand HH Goa graphic in seconds. No login. No gate.
          </p>
        </header>

        <div className="mt-8 flex justify-center gap-2">
          {(
            [
              ["pfp", "PFP Frame"],
              ["badge", "Builder ID"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`font-brand rounded-full border px-5 py-2 text-xs tracking-widest uppercase transition-colors ${
                mode === m
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground/80 hover:bg-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.05fr]">
          {/* controls */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <label
              htmlFor="photo"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border px-4 py-10 text-center transition-colors hover:border-primary"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFile(e.dataTransfer.files?.[0]);
              }}
            >
              <span className="font-brand text-sm text-foreground">
                {img ? "Change photo" : "Tap to upload your photo"}
              </span>
              <span className="font-brand mt-2 text-xs text-muted-foreground">
                JPG · PNG · WEBP · HEIC from iPhone
              </span>
            </label>
            <input
              id="photo"
              ref={fileInput}
              type="file"
              accept="image/*,.heic,.heif"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            {error && <p className="font-brand mt-3 text-xs text-destructive">{error}</p>}

            {mode === "badge" && (
              <div className="mt-5 space-y-4">
                <Field label="Name" value={name} onChange={setName} placeholder="Aditi Rao" />
                <Field
                  label="Stack / Role"
                  value={role}
                  onChange={setRole}
                  placeholder="Full-stack · TS + Postgres"
                />
                <Field label="X handle (optional)" value={handle} onChange={setHandle} placeholder="@handle" />
                <div>
                  <p className="font-brand text-[11px] tracking-widest text-muted-foreground uppercase">
                    Builder title
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-brand flex-1 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-accent">
                      {activeTitle}
                    </span>
                    <button
                      onClick={() =>
                        setTitle(builderTitle(seed + Math.random().toString(36).slice(2)) ?? "Builder")
                      }
                      className="font-brand rounded-xl border border-primary px-3 py-2 text-xs tracking-widest text-primary uppercase hover:bg-primary hover:text-primary-foreground"
                    >
                      Reroll
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={download}
                disabled={!preview}
                className="font-brand flex-1 rounded-full bg-primary px-5 py-3 text-xs tracking-widest text-primary-foreground uppercase disabled:opacity-40"
              >
                Download PNG
              </button>
              <button
                onClick={() => void shareToX()}
                disabled={!preview}
                className="font-brand flex-1 rounded-full border border-accent px-5 py-3 text-xs tracking-widest text-accent uppercase hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
              >
                Share to X
              </button>
            </div>
            <p className="font-brand mt-3 text-[11px] text-muted-foreground">
              On phones the image attaches straight to the share sheet. On desktop it downloads and
              opens a pre-filled tweet — just drop the file in.
            </p>
          </section>

          {/* preview */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="font-brand text-[11px] tracking-widest text-muted-foreground uppercase">
              Preview
            </p>
            <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-secondary">
              {preview ? (
                <img
                  src={preview}
                  alt="Your generated HH Goa 2026 graphic"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="font-brand px-6 text-center text-xs text-muted-foreground">
                  {busy ? "Reading your photo…" : "Your graphic shows up here instantly"}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="font-brand text-[11px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-brand mt-2 w-full rounded-xl border border-input bg-secondary px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </label>
  );
}
