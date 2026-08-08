export const BRAND = {
  green: "#0B6839",
  greenDeep: "#074427",
  cream: "#F5E9C8",
  sun: "#F2913D",
  sunDeep: "#E2542B",
  gold: "#F6C445",
};

export const TITLES = [
  "CHAOS ENGINEER",
  "LATE-NIGHT SHIPPER",
  "PROMPT WHISPERER",
  "COCONUT-POWERED DEV",
  "SUNRISE DEPLOYER",
  "BUG WHISPERER",
  "VIBE ARCHITECT",
  "MONSOON HACKER",
  "PIXEL SMUGGLER",
  "DEMO-DAY DAREDEVIL",
  "SERVERLESS SURFER",
  "TERMINAL MYSTIC",
];

export function builderTitle(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TITLES[h % TITLES.length];
}

/** Draw an image cover-fit (like object-fit: cover) into a box. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const r = Math.max(w / img.width, h / img.height);
  const dw = img.width * r;
  const dh = img.height * r;
  // bias vertically toward the top third — faces usually live there
  const ox = x + (w - dw) / 2;
  const oy = y + (h - dh) * 0.35;
  ctx.drawImage(img, ox, oy, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function textArc(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  spacing: number,
  flip = false,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(startAngle);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const ch of text) {
    ctx.save();
    if (flip) {
      ctx.translate(0, radius);
      ctx.rotate(Math.PI);
    } else {
      ctx.translate(0, -radius);
    }
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    ctx.rotate(spacing * (flip ? -1 : 1));
  }
  ctx.restore();
}

function palm(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -40, 2, -78);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    ctx.beginPath();
    ctx.moveTo(2, -78);
    ctx.quadraticCurveTo(2 + Math.cos(a) * 26, -78 + Math.sin(a) * 26, 2 + Math.cos(a) * 46, -70 + Math.sin(a) * 40);
    ctx.stroke();
  }
  ctx.restore();
}

function sunRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * (r + 26), cy + Math.sin(a) * (r + 26));
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------- Format A: PFP frame ---------------- */
export function renderPfp(img: HTMLImageElement, size = 1024): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const S = size / 1024;
  const cx = size / 2;

  // backdrop
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, BRAND.green);
  g.addColorStop(1, BRAND.greenDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  sunRays(ctx, cx, cx, 470 * S, "rgba(245,233,200,0.16)");

  // photo in a circle
  const r = 380 * S;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.clip();
  drawCover(ctx, img, cx - r, cx - r, r * 2, r * 2);
  ctx.restore();

  // rings
  ctx.strokeStyle = BRAND.cream;
  ctx.lineWidth = 10 * S;
  ctx.beginPath();
  ctx.arc(cx, cx, r + 6 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = BRAND.sun;
  ctx.lineWidth = 22 * S;
  ctx.beginPath();
  ctx.arc(cx, cx, r + 26 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([6 * S, 12 * S]);
  ctx.strokeStyle = BRAND.gold;
  ctx.lineWidth = 4 * S;
  ctx.beginPath();
  ctx.arc(cx, cx, r + 48 * S, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // curved wordmark top + bottom
  ctx.fillStyle = BRAND.cream;
  ctx.font = `700 ${44 * S}px "Victor Mono", monospace`;
  textArc(ctx, "HACKER HOUSE GOA", cx, cx, r + 100 * S, -0.62, 0.079);
  ctx.fillStyle = BRAND.gold;
  ctx.font = `700 ${40 * S}px "Victor Mono", monospace`;
  textArc(ctx, "· 2026 · #FRAMEINGOA ·", cx, cx, r + 96 * S, 0.72, 0.076, true);

  palm(ctx, 92 * S, 940 * S, 1.5 * S, "rgba(245,233,200,0.75)");
  palm(ctx, 932 * S, 940 * S, -1.5 * S, "rgba(245,233,200,0.75)");
  return c;
}

/* ---------------- Format B: Builder ID card ---------------- */
export function renderBadge(
  img: HTMLImageElement,
  data: { name: string; role: string; title: string; handle?: string },
  w = 1200,
): HTMLCanvasElement {
  const S = w / 1200;
  const h = Math.round(1500 * S);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, BRAND.green);
  g.addColorStop(1, BRAND.greenDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  sunRays(ctx, w / 2, 240 * S, 520 * S, "rgba(245,233,200,0.12)");

  // card
  const pad = 60 * S;
  const cw = w - pad * 2;
  const ch = h - pad * 2;
  ctx.fillStyle = BRAND.cream;
  roundRect(ctx, pad, pad, cw, ch, 44 * S);
  ctx.fill();
  ctx.strokeStyle = BRAND.sunDeep;
  ctx.lineWidth = 8 * S;
  roundRect(ctx, pad + 16 * S, pad + 16 * S, cw - 32 * S, ch - 32 * S, 32 * S);
  ctx.stroke();

  // header bar
  ctx.fillStyle = BRAND.green;
  roundRect(ctx, pad + 16 * S, pad + 16 * S, cw - 32 * S, 132 * S, 30 * S);
  ctx.fill();
  ctx.fillStyle = BRAND.cream;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${46 * S}px "Victor Mono", monospace`;
  ctx.fillText("HACKER HOUSE GOA", pad + 60 * S, pad + 82 * S);
  ctx.fillStyle = BRAND.gold;
  ctx.textAlign = "right";
  ctx.font = `700 ${46 * S}px "Victor Mono", monospace`;
  ctx.fillText("2026", w - pad - 60 * S, pad + 82 * S);

  // photo
  const px = pad + 70 * S;
  const py = pad + 200 * S;
  const pw = cw - 140 * S;
  const ph = 700 * S;
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 28 * S);
  ctx.clip();
  ctx.fillStyle = BRAND.greenDeep;
  ctx.fillRect(px, py, pw, ph);
  drawCover(ctx, img, px, py, pw, ph);
  ctx.restore();
  ctx.strokeStyle = BRAND.green;
  ctx.lineWidth = 6 * S;
  roundRect(ctx, px, py, pw, ph, 28 * S);
  ctx.stroke();

  // title chip
  const chipY = py + ph - 46 * S;
  const title = data.title.toUpperCase();
  ctx.font = `700 ${34 * S}px "Victor Mono", monospace`;
  const tw = ctx.measureText(title).width + 60 * S;
  ctx.fillStyle = BRAND.sunDeep;
  roundRect(ctx, px + pw / 2 - tw / 2, chipY, tw, 76 * S, 38 * S);
  ctx.fill();
  ctx.fillStyle = BRAND.cream;
  ctx.textAlign = "center";
  ctx.fillText(title, px + pw / 2, chipY + 39 * S);

  // name + role
  let y = py + ph + 120 * S;
  ctx.fillStyle = BRAND.greenDeep;
  ctx.textAlign = "center";
  let fs = 100 * S;
  const name = data.name.trim() || "BUILDER";
  do {
    ctx.font = `400 ${fs}px Imbue, "Times New Roman", serif`;
    fs -= 4 * S;
  } while (ctx.measureText(name).width > pw - 40 * S && fs > 40 * S);
  ctx.fillText(name, w / 2, y);

  y += 74 * S;
  ctx.fillStyle = BRAND.green;
  ctx.font = `600 ${36 * S}px "Victor Mono", monospace`;
  const role = (data.role.trim() || "builder").toUpperCase();
  ctx.fillText(role.length > 34 ? role.slice(0, 33) + "…" : role, w / 2, y);

  if (data.handle?.trim()) {
    y += 58 * S;
    ctx.fillStyle = BRAND.sunDeep;
    ctx.font = `600 ${34 * S}px "Victor Mono", monospace`;
    const hd = data.handle.trim().replace(/^@/, "");
    ctx.fillText("@" + hd, w / 2, y);
  }

  // footer
  ctx.fillStyle = BRAND.green;
  ctx.font = `700 ${30 * S}px "Victor Mono", monospace`;
  ctx.fillText("#FRAMEINGOA  ·  4 DAYS. ONE RHYTHM.", w / 2, pad + ch - 62 * S);
  palm(ctx, pad + 78 * S, pad + ch - 40 * S, 0.7 * S, "rgba(11,104,57,0.55)");
  palm(ctx, w - pad - 78 * S, pad + ch - 40 * S, -0.7 * S, "rgba(11,104,57,0.55)");
  return c;
}

export function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed"))), "image/png"),
  );
}

/** Load any user photo (jpg/png/webp/HEIC) into an <img>. */
export async function loadPhoto(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;
  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default as (o: {
      blob: Blob;
      toType?: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    blob = Array.isArray(out) ? out[0] : out;
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Could not read that image"));
      img.src = url;
    });
    await img.decode?.().catch(() => {});
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}
