const sharp = require("sharp");
const path = require("path");

const tasks = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon-maskable.svg", out: "icon-192-maskable.png", size: 192 },
  { src: "icon-maskable.svg", out: "icon-512-maskable.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
];

const dir = path.join(__dirname, "..", "public", "icons");

async function run() {
  for (const t of tasks) {
    await sharp(path.join(dir, t.src))
      .resize(t.size, t.size)
      .png()
      .toFile(path.join(dir, t.out));
    console.log("created", t.out);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
