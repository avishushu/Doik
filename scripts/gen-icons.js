const sharp = require("sharp");
const path = require("path");

const SOURCE = "doik_app_logo_1024.png";
const BG = { r: 0, g: 0, b: 0, alpha: 1 };

const dir = path.join(__dirname, "..", "public", "icons");

async function run() {
  // אייקונים רגילים - בדיוק כמו שעוצבו, בלי חיתוך
  for (const size of [192, 512]) {
    await sharp(path.join(dir, SOURCE))
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(path.join(dir, `icon-${size}.png`));
    console.log("created icon-" + size + ".png");
  }

  // apple touch icon
  await sharp(path.join(dir, SOURCE))
    .resize(180, 180, { fit: "cover" })
    .png()
    .toFile(path.join(dir, "apple-touch-icon.png"));
  console.log("created apple-touch-icon.png");

  // גרסאות maskable - עם ריפוד בטוח כדי שהכיתוב לא ייחתך בחיתוך העגול של אנדרואיד
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.72);
    await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([
        {
          input: await sharp(path.join(dir, SOURCE)).resize(inner, inner, { fit: "contain" }).toBuffer(),
          gravity: "center",
        },
      ])
      .png()
      .toFile(path.join(dir, `icon-${size}-maskable.png`));
    console.log("created icon-" + size + "-maskable.png");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
