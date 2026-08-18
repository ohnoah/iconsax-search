#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import console from "node:console";
import { createRequire } from "node:module";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const TOKEN_ALIASES = {
  add: ["create", "new", "plus"],
  arrow: ["direction", "navigation"],
  call: ["phone", "telephone"],
  close: ["dismiss", "cancel"],
  document: ["file", "page"],
  down: ["below", "bottom"],
  edit: ["pencil", "write"],
  favorite: ["favourite", "starred"],
  folder: ["directory"],
  gallery: ["image", "photo", "picture"],
  heart: ["like", "love", "favorite"],
  left: ["back", "previous"],
  message: ["chat", "comment"],
  minus: ["remove", "subtract"],
  notification: ["bell", "alert"],
  profile: ["user", "person", "account"],
  refresh: ["reload", "sync", "retry"],
  remove: ["delete", "clear"],
  right: ["forward", "next"],
  search: ["find", "lookup"],
  setting: ["settings", "preferences", "gear", "cog"],
  share: ["send", "forward"],
  tick: ["check", "confirm", "done"],
  trash: ["delete", "bin", "remove"],
  up: ["above", "top"],
  user: ["person", "profile", "account"],
  warning: ["alert", "caution", "danger"],
};
const CHECK_MODE = process.argv.includes("--check");
const USAGE_ROOT = readOption("--usage-root");
const UNKNOWN_OPTIONS = process.argv.slice(2).filter((value, index, values) => {
  if (value === "--check") {
    return false;
  }

  if (value === "--usage-root" || values[index - 1] === "--usage-root") {
    return false;
  }

  return true;
});

if (UNKNOWN_OPTIONS.length > 0) {
  fail(`Unknown option(s): ${UNKNOWN_OPTIONS.join(", ")}`);
}

const packageRoot = findPackageRoot("iconsax-react");
const packageJson = readJson(path.join(packageRoot, "package.json"));
const declarationSource = fs.readFileSync(path.join(packageRoot, "dist", "index.d.ts"), "utf8");
const sourceMetadata = readJson(path.join(packageRoot, "dist", "meta-data.json"));
const aliasMetadata = readJson(path.join(REPOSITORY_ROOT, "metadata", "aliases.json"));
const iconNames = [...declarationSource.matchAll(/^export const (\w+): Icon;$/gm)].map(match => match[1]);
const iconNameSet = new Set(iconNames);

if (iconNames.length === 0) {
  fail("No icon exports were found in iconsax-react/dist/index.d.ts.");
}

const categoryByIcon = createCategoryIndex(sourceMetadata, iconNameSet);
validateAliasMetadata(aliasMetadata, iconNameSet);

const usageSnapshotPath = path.join(REPOSITORY_ROOT, "metadata", "repo-usage.snapshot.json");
let usageByIcon = readUsageSnapshot(usageSnapshotPath, iconNameSet);
const outputFiles = new Map();

if (USAGE_ROOT != null) {
  const absoluteUsageRoot = path.resolve(REPOSITORY_ROOT, USAGE_ROOT);
  usageByIcon = scanRepoUsage(absoluteUsageRoot, iconNameSet);
  outputFiles.set(
    usageSnapshotPath,
    json({
      version: 1,
      source: path.basename(absoluteUsageRoot),
      icons: Object.fromEntries([...usageByIcon].filter(([, count]) => count > 0).sort(([left], [right]) => left.localeCompare(right))),
    }),
  );
}

const aliasesByIcon = createAliasIndex(aliasMetadata);
const categoryNames = unique(iconNames.map(name => categoryByIcon.get(name) ?? "Uncategorized"));
const variants = readStringArray(sourceMetadata.variants, "metadata variants");
const catalog = iconNames.map(name => createCatalogEntry(name, categoryByIcon, aliasesByIcon, usageByIcon));

outputFiles.set(
  path.join(REPOSITORY_ROOT, "metadata", "iconsax-metadata.snapshot.json"),
  json(sourceMetadata),
);
outputFiles.set(
  path.join(REPOSITORY_ROOT, "metadata", "iconsax-metadata.provenance.json"),
  json({
    package: "iconsax-react",
    version: packageJson.version,
    source: "node_modules/iconsax-react/dist/meta-data.json",
    repository: packageJson.repository,
    generator: "scripts/generate-icon-catalog.mjs",
    iconCount: iconNames.length,
  }),
);
outputFiles.set(
  path.join(REPOSITORY_ROOT, "src", "catalog", "iconRegistry.generated.ts"),
  generateRegistrySource(iconNames, packageJson.version),
);
outputFiles.set(
  path.join(REPOSITORY_ROOT, "src", "catalog", "iconCatalog.generated.ts"),
  generateCatalogSource(catalog, categoryNames, variants, packageJson.version),
);

const staleFiles = [];
for (const [outputPath, content] of outputFiles) {
  const relativePath = path.relative(REPOSITORY_ROOT, outputPath);
  const currentContent = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : undefined;

  if (currentContent === content) {
    continue;
  }

  if (CHECK_MODE) {
    staleFiles.push(relativePath);
    continue;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Generated ${relativePath}`);
}

if (staleFiles.length > 0) {
  console.error("Generated icon catalog files are stale:");
  for (const staleFile of staleFiles) {
    console.error(`- ${staleFile}`);
  }
  console.error("Run `npm run catalog:generate` and commit the result.");
  process.exitCode = 1;
} else if (CHECK_MODE) {
  console.log(`Icon catalog is current for iconsax-react ${packageJson.version} (${iconNames.length} icons).`);
}

function readOption(name) {
  const optionIndex = process.argv.indexOf(name);
  if (optionIndex === -1) {
    return undefined;
  }

  const value = process.argv[optionIndex + 1];
  if (value == null || value.startsWith("--")) {
    fail(`${name} requires a path.`);
  }

  return value;
}

function findPackageRoot(packageName) {
  const require = createRequire(import.meta.url);
  let currentDirectory = path.dirname(require.resolve(packageName));

  while (currentDirectory !== path.dirname(currentDirectory)) {
    const packagePath = path.join(currentDirectory, "package.json");
    if (fs.existsSync(packagePath)) {
      const candidatePackage = readJson(packagePath);
      if (candidatePackage.name === packageName) {
        return currentDirectory;
      }
    }
    currentDirectory = path.dirname(currentDirectory);
  }

  fail(`Could not find the ${packageName} package root.`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function createCategoryIndex(metadata, iconNameSet) {
  const categoryByIcon = new Map();
  const metadataIcons = new Set();

  if (!Array.isArray(metadata.categories)) {
    fail("iconsax-react metadata does not contain a categories array.");
  }

  for (const category of metadata.categories) {
    if (typeof category.name !== "string" || !Array.isArray(category.icons)) {
      fail("iconsax-react metadata contains an invalid category.");
    }

    for (const rawIconName of category.icons) {
      if (typeof rawIconName !== "string") {
        fail(`Category ${category.name} contains a non-string icon name.`);
      }

      const iconName = normalizeMetadataIconName(rawIconName, iconNameSet);
      if (iconName == null) {
        fail(`Metadata references ${rawIconName}, which is not exported by iconsax-react.`);
      }

      metadataIcons.add(iconName);
      categoryByIcon.set(iconName, cleanCategoryName(category.name));
    }
  }

  const uncategorizedIcons = [...iconNameSet].filter(name => !metadataIcons.has(name));
  if (uncategorizedIcons.length > 0) {
    fail(`Metadata is missing ${uncategorizedIcons.length} exports: ${uncategorizedIcons.slice(0, 10).join(", ")}`);
  }

  return categoryByIcon;
}

function normalizeMetadataIconName(iconName, iconNameSet) {
  if (iconNameSet.has(iconName)) {
    return iconName;
  }

  // The upstream repository has shipped this corrected spelling in some metadata revisions,
  // while the npm component export retains the historical spelling.
  if (iconName === "HamburgerMenu" && iconNameSet.has("HambergerMenu")) {
    return "HambergerMenu";
  }

  return undefined;
}

function cleanCategoryName(categoryName) {
  const correctedNames = {
    Essetional: "Essential",
    Programing: "Programming",
  };
  return correctedNames[categoryName] ?? categoryName;
}

function validateAliasMetadata(metadata, iconNameSet) {
  if (!Array.isArray(metadata.concepts)) {
    fail("metadata/aliases.json must contain a concepts array.");
  }

  for (const concept of metadata.concepts) {
    const aliases = readStringArray(concept.aliases, "concept aliases");
    const icons = readStringArray(concept.icons, "concept icons");
    if (aliases.length === 0 || icons.length === 0) {
      fail("Every alias concept must include at least one alias and icon.");
    }

    const unknownIcons = icons.filter(iconName => !iconNameSet.has(iconName));
    if (unknownIcons.length > 0) {
      fail(`Alias metadata references unknown icon(s): ${unknownIcons.join(", ")}`);
    }
  }
}

function createAliasIndex(metadata) {
  const aliasesByIcon = new Map();

  for (const concept of metadata.concepts) {
    for (const iconName of concept.icons) {
      aliasesByIcon.set(iconName, unique([...(aliasesByIcon.get(iconName) ?? []), ...concept.aliases]));
    }
  }

  return aliasesByIcon;
}

function createCatalogEntry(name, categoryByIcon, aliasesByIcon, usageByIcon) {
  const category = categoryByIcon.get(name) ?? "Uncategorized";
  const tokens = splitSearchTokens(name);
  const spellingTokens = tokens.map(correctKnownSpelling);
  const inferredAliases = spellingTokens.flatMap(token => TOKEN_ALIASES[token] ?? []);
  const aliases = unique([...(aliasesByIcon.get(name) ?? []), ...inferredAliases, ...spellingTokens.filter((token, index) => token !== tokens[index])]);
  const categoryTokens = splitSearchTokens(category);
  const keywords = unique([...tokens, ...spellingTokens, ...categoryTokens, ...aliases]);
  const usageCount = usageByIcon.get(name) ?? 0;

  return {
    name,
    category,
    aliases,
    keywords,
    tokens: unique([...tokens, ...spellingTokens]),
    usedInRepo: usageCount > 0,
    usageCount,
  };
}

function splitSearchTokens(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .map(token => token.toLowerCase())
    .filter(Boolean);
}

function correctKnownSpelling(token) {
  const correctedTokens = {
    brifecase: "briefcase",
    buliding: "building",
    cirlce: "circle",
    cricle: "circle",
    disscount: "discount",
    essetional: "essential",
    hamberger: "hamburger",
    mobbile: "mobile",
    pharagraphspacing: "paragraph spacing",
    presention: "presentation",
    programing: "programming",
    recive: "receive",
    repeate: "repeat",
    sqaure: "square",
    trush: "trash",
  };
  return correctedTokens[token] ?? token;
}

function readUsageSnapshot(snapshotPath, iconNameSet) {
  if (!fs.existsSync(snapshotPath)) {
    return new Map();
  }

  const snapshot = readJson(snapshotPath);
  if (snapshot.icons == null || typeof snapshot.icons !== "object" || Array.isArray(snapshot.icons)) {
    fail("metadata/repo-usage.snapshot.json must contain an icons object.");
  }

  const result = new Map();
  for (const [iconName, count] of Object.entries(snapshot.icons)) {
    if (!iconNameSet.has(iconName)) {
      fail(`Repo usage snapshot references unknown icon ${iconName}.`);
    }
    if (!Number.isInteger(count) || count < 1) {
      fail(`Repo usage count for ${iconName} must be a positive integer.`);
    }
    result.set(iconName, count);
  }
  return result;
}

function scanRepoUsage(repoRoot, iconNameSet) {
  if (!fs.existsSync(repoRoot)) {
    fail(`Usage root does not exist: ${repoRoot}`);
  }

  const usageByIcon = new Map();
  const sourceFiles = collectSourceFiles(repoRoot);
  const iconImportPattern = /import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g;

  for (const sourceFile of sourceFiles) {
    const content = fs.readFileSync(sourceFile, "utf8");
    for (const match of content.matchAll(iconImportPattern)) {
      const moduleName = match[2];
      if (!moduleName.includes("iconsax-react") && !moduleName.includes("iconsax-mui") && !moduleName.includes("components/icons")) {
        continue;
      }

      for (const specifier of match[1].split(",")) {
        const importedName = specifier.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, "").trim();
        if (iconNameSet.has(importedName)) {
          usageByIcon.set(importedName, (usageByIcon.get(importedName) ?? 0) + 1);
        }
      }
    }
  }

  return usageByIcon;
}

function collectSourceFiles(root) {
  const sourceFiles = [];
  const excludedDirectories = new Set([".git", ".next", "dist", "node_modules"]);

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      sourceFiles.push(...collectSourceFiles(entryPath));
    } else if (/\.[cm]?[jt]sx?$/.test(entry.name) && !entry.name.endsWith("iconsax-mui.ts")) {
      sourceFiles.push(entryPath);
    }
  }

  return sourceFiles;
}

function generateRegistrySource(iconNames, packageVersion) {
  return `// AUTO-GENERATED FILE - DO NOT EDIT.\n// iconsax-react ${packageVersion}; generated by scripts/generate-icon-catalog.mjs.\n\nimport {\n${iconNames.map(name => `  ${name},`).join("\n")}\n  type Icon as IconsaxIcon,\n} from "iconsax-react";\n\nexport const iconRegistry = {\n${iconNames.map(name => `  ${name},`).join("\n")}\n} satisfies Readonly<Record<string, IconsaxIcon>>;\n\nexport type IconName = keyof typeof iconRegistry;\n`;
}

function generateCatalogSource(catalog, categoryNames, variants, packageVersion) {
  const serializedCatalog = JSON.stringify(catalog, null, 2).replace(/^/gm, "");
  return `// AUTO-GENERATED FILE - DO NOT EDIT.\n// iconsax-react ${packageVersion}; generated by scripts/generate-icon-catalog.mjs.\n\nimport type { IconCatalogEntry } from "./types";\n\nexport const ICON_CATALOG_VERSION = ${JSON.stringify(packageVersion)};\n\nexport const ICON_VARIANTS = ${JSON.stringify(variants)} as const;\n\nexport const ICON_CATEGORIES = ${JSON.stringify(categoryNames)} as const;\n\nexport const iconCatalog = ${serializedCatalog} as const satisfies readonly IconCatalogEntry[];\n`;
}

function readStringArray(value, label) {
  if (!Array.isArray(value) || value.some(item => typeof item !== "string")) {
    fail(`Expected ${label} to be an array of strings.`);
  }
  return value;
}

function unique(values) {
  return [...new Set(values)];
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
