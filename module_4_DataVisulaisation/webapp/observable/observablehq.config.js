import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function readDotEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    out[key] = value;
  }
  return out;
}

const envFile = readDotEnv(resolve(here, ".env"));
const apiBaseUrl = process.env.API_BASE_URL ?? envFile.API_BASE_URL ?? "http://localhost:3001";

// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "DLT-FRUIT graph explorer",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Examples",
      pages: [
        { name: "Dashboard", path: "/example-dashboard" },
        { name: "Report", path: "/example-report" },
        { name: "Grafo", path: "/test" }
      ]
    }
  ],

  middleware: [
    (req, res, next) => {
      if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      next();
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: `<link rel="icon" href="observable.png" type="image/png" sizes="32x32">
<script>window.__API_BASE_URL = ${JSON.stringify(apiBaseUrl)};</script>`,

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: "", // what to show in the footer (HTML)
  sidebar: false, // whether to show the sidebar
  toc: false, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
