import { describe, expect, it } from "vitest";

import type { IconCatalogEntry } from "../catalog/types";
import { normalizeSearchTerm, searchIcons } from "./searchIcons";

const ENTRIES = [
    createEntry("Trash", "Essential", ["delete", "bin", "remove"]),
    createEntry("Setting2", "Settings", ["gear", "preferences", "configuration"]),
    createEntry("HambergerMenu", "Essential", ["hamburger", "navigation", "drawer"]),
    createEntry("PresentionChart", "Business", ["presentation", "deck", "slides"]),
    createEntry("UserRemove", "Users", ["remove user", "delete account"]),
] as const;

describe("normalizeSearchTerm", () => {
    it("splits component names and punctuation", () => {
        expect(normalizeSearchTerm("SearchNormal-1")).toBe("search normal 1");
    });
});

describe("searchIcons", () => {
    it.each([
        ["delete", "Trash"],
        ["gear", "Setting2"],
        ["hamburger", "HambergerMenu"],
        ["presentation", "PresentionChart"],
        ["settng", "Setting2"],
    ])("ranks %s as %s", (query, expectedName) => {
        expect(searchIcons(ENTRIES, query)[0]?.entry.name).toBe(expectedName);
    });

    it("uses multiple semantic terms to disambiguate", () => {
        expect(searchIcons(ENTRIES, "delete account")[0]?.entry.name).toBe("UserRemove");
    });

    it("supports category and in-repo filters", () => {
        const entries = [
            createEntry("Trash", "Essential", ["delete"], true),
            createEntry("UserRemove", "Users", ["delete"], false),
        ];

        expect(searchIcons(entries, "delete", { category: "Users" }).map(result => result.entry.name)).toEqual([
            "UserRemove",
        ]);
        expect(searchIcons(entries, "delete", { usedInRepoOnly: true }).map(result => result.entry.name)).toEqual([
            "Trash",
        ]);
    });

    it("returns catalog order for an empty query and respects a limit", () => {
        expect(searchIcons(ENTRIES, "", { limit: 2 }).map(result => result.entry.name)).toEqual([
            "Trash",
            "Setting2",
        ]);
    });
});

function createEntry(
    name: string,
    category: string,
    aliases: readonly string[],
    usedInRepo = false,
): IconCatalogEntry {
    return {
        name,
        category,
        aliases,
        keywords: aliases,
        tokens: normalizeSearchTerm(name).split(" "),
        usedInRepo,
        usageCount: usedInRepo ? 1 : 0,
    };
}
