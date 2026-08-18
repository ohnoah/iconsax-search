import { describe, expect, it } from "vitest";

import {
  ICON_CATALOG_VERSION,
  ICON_CATEGORIES,
  ICON_VARIANTS,
  iconCatalog,
} from "./iconCatalog.generated";
import { iconRegistry } from "./iconRegistry.generated";
import { searchIcons } from "../search/searchIcons";

describe("generated icon catalog", () => {
  it("matches the complete pinned iconsax-react package", () => {
    const catalogNames = iconCatalog.map(entry => entry.name);
    const registryNames = Object.keys(iconRegistry);

    expect(ICON_CATALOG_VERSION).toBe("0.0.8");
    expect(iconCatalog).toHaveLength(993);
    expect(new Set(catalogNames).size).toBe(iconCatalog.length);
    expect(catalogNames).toEqual(registryNames);
  });

  it("includes all package variants and category metadata", () => {
    expect(ICON_VARIANTS).toEqual(["Bold", "Broken", "Bulk", "Linear", "Outline", "TwoTone"]);
    expect(ICON_CATEGORIES).toContain("Essential");
    expect(ICON_CATEGORIES).toContain("Programming");
    expect(iconCatalog.every(entry => ICON_CATEGORIES.includes(entry.category))).toBe(true);
  });

  it("adds corrected spelling and curated semantic aliases", () => {
    const hamburgerMenu = iconCatalog.find(entry => entry.name === "HambergerMenu");
    const presentationChart = iconCatalog.find(entry => entry.name === "PresentionChart");
    const trash = iconCatalog.find(entry => entry.name === "Trash");

    expect(hamburgerMenu?.keywords).toContain("hamburger");
    expect(presentationChart?.keywords).toContain("presentation");
    expect(presentationChart?.aliases).toContain("deck");
    expect(trash?.aliases).toContain("bin");
  });

  it.each([
    ["delete", "Trash"],
    ["gear", "Setting"],
    ["hamburger", "HambergerMenu"],
    ["deck", "PresentionChart"],
  ])("makes %s find %s", (query, expectedName) => {
    expect(searchIcons(iconCatalog, query)[0]?.entry.name).toBe(expectedName);
  });
});
