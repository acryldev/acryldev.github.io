// The framework docs: the markdown tree in src/docs/framework (synced from the acrylblends repository, see scripts/sync-framework-docs.mjs), as pages and a sidebar.
const files = import.meta.glob("../docs/framework/**/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const licenses = import.meta.glob("../docs/framework/LICENS*", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export interface DocPageData { key: string; title: string; markdown: string }

const prefix = "../docs/framework/";
const titleOf = (markdown: string, fallback: string) => /^#\s+(.+)$/m.exec(markdown)?.[1]?.trim() ?? fallback;
const keyOf = (path: string) => path.slice(prefix.length).replace(/\.md$/, "");

export const pages = new Map<string, DocPageData>();
for (const [path, markdown] of Object.entries(files)) {
  const key = keyOf(path);
  pages.set(key, { key, title: titleOf(markdown, key), markdown });
}
for (const markdown of Object.values(licenses)) pages.set("LICENSE", { key: "LICENSE", title: "License", markdown: `# License\n\n\`\`\`text\n${markdown.trim()}\n\`\`\`\n` });

/** The URL of a page: the index is /docs itself. */
export const docUrl = (key: string) => (key === "README" ? "/docs" : `/docs/${key === "LICENSE" ? "license" : key}`);
export const keyFromUrl = (splat: string | undefined) => {
  const path = (splat ?? "").replace(/\/$/, "");
  if (path === "") return "README";
  if (path === "license") return "LICENSE";
  return path;
};

const SECTIONS: { title: string; folder?: string; keys: string[] }[] = [
  { title: "Introduction", keys: ["README"] },
  { title: "Getting started", folder: "getting-started", keys: ["getting-started/basic", "getting-started/nodejs", "getting-started/bun", "getting-started/deno", "getting-started/other-runtimes"] },
  { title: "API", folder: "api", keys: ["api/index", "api/acryl", "api/routing", "api/context", "api/request", "api/exception", "api/presets", "api/summary"] },
  { title: "Concepts", folder: "concepts", keys: ["concepts/motivation", "concepts/web-standard", "concepts/routers", "concepts/middleware", "concepts/developer-experience", "concepts/stacks", "concepts/benchmarks"] },
  { title: "Guides", folder: "guides", keys: ["guides/best-practices", "guides/helpers", "guides/middleware", "guides/validation", "guides/rpc", "guides/testing", "guides/create-acrylblends", "guides/jsx", "guides/jsx-dom", "guides/faq", "guides/examples"] },
  { title: "Helpers", folder: "helpers", keys: [] },
  { title: "Middleware", folder: "middleware", keys: [] },
  { title: "Cordis", folder: "cordis", keys: ["cordis/acryl-in-a-cordis-app", "cordis/concepts", "cordis/mounting", "cordis/validation", "cordis/middleware", "cordis/transport-and-cancellation", "cordis/plugin-lifecycle", "cordis/node-server", "cordis/surfaces", "cordis/migration-from-0-3", "cordis/migration-from-dsh-webserver"] },
  { title: "Agents", folder: "agents", keys: ["agents/index"] },
  { title: "License", keys: ["LICENSE"] },
];

/** The sidebar: the listed pages in order, then any other page of the section's folder, alphabetically, so a new page is never left out. */
export const nav = SECTIONS.map((section) => {
  const listed = section.keys.filter((key) => pages.has(key));
  const rest = section.folder
    ? [...pages.keys()].filter((key) => key.startsWith(`${section.folder}/`) && !listed.includes(key)).sort()
    : [];
  return { title: section.title, keys: [...listed, ...rest] };
});

/** Resolve a link written in a page (`../api/routing.md#x`) to a site path. Other links are returned unchanged. */
export function resolveLink(fromKey: string, href: string): { href: string; external: boolean } {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return { href, external: !href.startsWith("#") };
  const [path = "", hash] = href.split("#");
  const parts = fromKey.split("/").slice(0, -1);
  for (const segment of path.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment !== "." && segment !== "") parts.push(segment);
  }
  const key = parts.join("/").replace(/\.md$/, "");
  return { href: `${docUrl(pages.has(key) ? key : key)}${hash ? `#${hash}` : ""}`, external: false };
}
