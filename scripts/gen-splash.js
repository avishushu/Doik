const sharp = require("sharp");
const path = require("path");

const sizes = [
  { name: "iphone-se", w: 750, h: 1334 },
  { name: "iphone-standard", w: 1170, h: 2532 },
  { name: "iphone-plus", w: 1284, h: 2778 },
  { name: "iphone-pro-max", w: 1290, h: 2796 },
];

const dir = path.join(__dirname, "..", "public");
const bg = "#000000";

async function run() {
  for (const s of sizes) {
    const logoSize = Math.round(Math.min(s.w, s.h) * 0.42);
    const svg = `<svg width="${s.w}" height="${s.h}" xmlns="http://www.w3.org/2000/svg"><rect width="${s.w}" height="${s.h}" fill="${bg}"/></svg>`;
    const base = sharp(Buffer.from(svg));

    const logo = await sharp(path.join(dir, "icons", "doik_app_logo_1024.png"))
      .resize(logoSize, logoSize, { fit: "contain" })
      .png()
      .toBuffer();

    await base
      .composite([{ input: logo, left: Math.round((s.w - logoSize) / 2), top: Math.round((s.h - logoSize) / 2) }])
      .png()
      .toFile(path.join(dir, "splash", `${s.name}.png`));
    console.log("created splash", s.name);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
