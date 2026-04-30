const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const indexPath = path.join(distDir, "index.html");
const notFoundPath = path.join(distDir, "404.html");
const noJekyllPath = path.join(distDir, ".nojekyll");
const expoAssetsPath = path.join(distDir, "_expo");
const sourceFontsPath = path.join(
  distDir,
  "assets",
  "node_modules",
  "@expo",
  "vector-icons",
  "build",
  "vendor",
  "react-native-vector-icons",
  "Fonts",
);
const publicFontsPath = path.join(distDir, "fonts");
const publicPath = "/SplitTrip";
const cacheBust = Date.now();

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html was not generated. Run `npm run build:web` again and check the Expo export output.");
}

if (!fs.existsSync(expoAssetsPath)) {
  throw new Error("dist/_expo was not generated. GitHub Pages will not be able to load the app bundle.");
}

if (!fs.existsSync(sourceFontsPath)) {
  throw new Error("Expo vector icon fonts were not generated. Icon rendering will fail on GitHub Pages.");
}

fs.mkdirSync(publicFontsPath, { recursive: true });
for (const fontFile of fs.readdirSync(sourceFontsPath)) {
  if (fontFile.endsWith(".ttf")) {
    fs.copyFileSync(path.join(sourceFontsPath, fontFile), path.join(publicFontsPath, fontFile));
  }
}

const rewriteAssetUrls = (content) =>
  content
    .replaceAll('href="./_expo/', `href="${publicPath}/_expo/`)
    .replaceAll('src="./_expo/', `src="${publicPath}/_expo/`)
    .replaceAll('href="./favicon.ico"', `href="${publicPath}/favicon.ico"`)
    .replaceAll('href="/_expo/', `href="${publicPath}/_expo/`)
    .replaceAll('src="/_expo/', `src="${publicPath}/_expo/`)
    .replaceAll('href="/favicon.ico"', `href="${publicPath}/favicon.ico"`)
    .replace(/(["'`])\/assets\//g, `$1${publicPath}/assets/`)
    .replace(/url\(\s*\/assets\//g, `url(${publicPath}/assets/`)
    .replace(
      /\/SplitTrip\/assets\/node_modules\/@expo\/vector-icons\/build\/vendor\/react-native-vector-icons\/Fonts\/([^"'`)]*?\.ttf)/g,
      `${publicPath}/fonts/$1`,
    );

const rewriteFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      rewriteFiles(entryPath);
      continue;
    }

    if (!/\.(html|js|css)$/.test(entry.name)) {
      continue;
    }

    fs.writeFileSync(entryPath, rewriteAssetUrls(fs.readFileSync(entryPath, "utf8")));
  }
};

rewriteFiles(distDir);
const html = fs
  .readFileSync(indexPath, "utf8")
  .replace(/(href="[^"]+\.(?:css|ico))"/g, `$1?v=${cacheBust}"`)
  .replace(/(src="[^"]+\.js)"/g, `$1?v=${cacheBust}"`);
fs.writeFileSync(indexPath, html);
fs.writeFileSync(notFoundPath, html);
fs.writeFileSync(noJekyllPath, "");
