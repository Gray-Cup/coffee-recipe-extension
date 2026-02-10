import { Glob } from "bun";

// Clean and create dist directory
await Bun.$`rm -rf dist && mkdir -p dist/images`;

// Bundle the newtab entry point (Bun inlines the JSON import)
const result = await Bun.build({
  entrypoints: ["./src/newtab.ts"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  minify: true,
  naming: "[name].[ext]",
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Copy static assets to dist
await Promise.all([
  Bun.write("dist/newtab.html", Bun.file("src/newtab.html")),
  Bun.write("dist/newtab.css", Bun.file("src/newtab.css")),
  Bun.write("dist/manifest.json", Bun.file("src/manifest.json")),
]);

// Copy SVG images
const glob = new Glob("*.svg");
for await (const file of glob.scan("src/data/images")) {
  await Bun.write(`dist/images/${file}`, Bun.file(`src/data/images/${file}`));
}

console.log("Build complete! Load dist/ as unpacked extension in chrome://extensions");
