import type { IconCatalogEntry } from "../catalog/types";

export interface IconSearchOptions {
    readonly category?: string;
    readonly usedInRepoOnly?: boolean;
    readonly limit?: number;
}

export interface IconSearchResult {
    readonly entry: IconCatalogEntry;
    readonly score: number;
    readonly matchedTerms: readonly string[];
}

interface ScoredMatch {
    readonly score: number;
    readonly labels: readonly string[];
}

const COMPACT_SEARCH_CHARACTERS = /[^a-z0-9]/g;
const DIACRITICS = /\p{Diacritic}/gu;
const PASCAL_CASE_BOUNDARY = /([a-z0-9])([A-Z])/g;
const LETTER_NUMBER_BOUNDARY = /([A-Za-z])(\d)/g;
const NUMBER_LETTER_BOUNDARY = /(\d)([A-Za-z])/g;
const SEARCH_SEPARATORS = /[^a-zA-Z0-9]+/g;

export function normalizeSearchTerm(value: string): string {
    return value
        .replace(PASCAL_CASE_BOUNDARY, "$1 $2")
        .replace(LETTER_NUMBER_BOUNDARY, "$1 $2")
        .replace(NUMBER_LETTER_BOUNDARY, "$1 $2")
        .normalize("NFKD")
        .replace(DIACRITICS, "")
        .replace(SEARCH_SEPARATORS, " ")
        .trim()
        .toLowerCase();
}

export function searchIcons(
    entries: readonly IconCatalogEntry[],
    query: string,
    options: IconSearchOptions = {},
): readonly IconSearchResult[] {
    const normalizedQuery = normalizeSearchTerm(query);
    const queryTerms = normalizedQuery.split(" ").filter(term => term.length > 0);
    const filteredEntries = entries.filter(entry => matchesFilters(entry, options));

    if (queryTerms.length === 0) {
        return applyLimit(
            filteredEntries.map(entry => ({ entry, score: 0, matchedTerms: [] })),
            options.limit,
        );
    }

    const results = filteredEntries
        .map(entry => scoreEntry(entry, normalizedQuery, queryTerms))
        .filter((result): result is IconSearchResult => result != null)
        .sort(
            (left, right) =>
                right.score - left.score ||
                left.entry.name.length - right.entry.name.length ||
                left.entry.name.localeCompare(right.entry.name),
        );

    return applyLimit(results, options.limit);
}

function matchesFilters(entry: IconCatalogEntry, options: IconSearchOptions): boolean {
    if (options.category != null && options.category !== "All" && entry.category !== options.category) {
        return false;
    }

    return options.usedInRepoOnly !== true || entry.usedInRepo;
}

function applyLimit<T>(values: readonly T[], limit: number | undefined): readonly T[] {
    if (limit == null) {
        return values;
    }

    return values.slice(0, Math.max(0, limit));
}

function scoreEntry(
    entry: IconCatalogEntry,
    normalizedQuery: string,
    queryTerms: readonly string[],
): IconSearchResult | undefined {
    const normalizedName = normalizeSearchTerm(entry.name);
    const compactName = normalizedName.replace(COMPACT_SEARCH_CHARACTERS, "");
    const compactQuery = normalizedQuery.replace(COMPACT_SEARCH_CHARACTERS, "");
    const normalizedAliases = entry.aliases.map(normalizeSearchTerm);
    const normalizedKeywords = entry.keywords.map(normalizeSearchTerm);
    const normalizedCategory = normalizeSearchTerm(entry.category);
    const searchableTerms = unique([
        ...entry.tokens.map(normalizeSearchTerm),
        ...normalizedName.split(" "),
        ...normalizedAliases.flatMap(alias => alias.split(" ")),
        ...normalizedKeywords.flatMap(keyword => keyword.split(" ")),
        ...normalizedCategory.split(" "),
    ]).filter(term => term.length > 0);

    let score = 0;
    const matchedLabels: string[] = [];

    if (compactName === compactQuery) {
        score += 1_400;
        matchedLabels.push("exact name");
    } else if (normalizedName.startsWith(normalizedQuery)) {
        score += 900;
        matchedLabels.push("name prefix");
    } else if (normalizedName.includes(normalizedQuery)) {
        score += 620;
        matchedLabels.push("name");
    }

    const aliasPhraseMatch = scorePhrases(normalizedAliases, normalizedQuery, "alias");
    score += aliasPhraseMatch.score;
    matchedLabels.push(...aliasPhraseMatch.labels);

    const keywordPhraseMatch = scorePhrases(normalizedKeywords, normalizedQuery, "keyword");
    score += Math.round(keywordPhraseMatch.score * 0.75);
    matchedLabels.push(...keywordPhraseMatch.labels);

    let matchedQueryTermCount = 0;
    for (const queryTerm of queryTerms) {
        const termMatch = bestTermMatch(queryTerm, searchableTerms);
        if (termMatch > 0) {
            matchedQueryTermCount += 1;
            score += termMatch;
        }
    }

    if (matchedQueryTermCount === 0 || score === 0) {
        return undefined;
    }

    if (matchedQueryTermCount === queryTerms.length) {
        score += queryTerms.length * 90;
        matchedLabels.push(queryTerms.length > 1 ? "all terms" : "term");
    } else {
        score -= (queryTerms.length - matchedQueryTermCount) * 120;
    }

    if (normalizedCategory === normalizedQuery) {
        score += 180;
        matchedLabels.push("category");
    }

    if (score <= 0) {
        return undefined;
    }

    return {
        entry,
        score,
        matchedTerms: unique(matchedLabels),
    };
}

function scorePhrases(phrases: readonly string[], query: string, label: string): ScoredMatch {
    let score = 0;
    let matched = false;

    for (const phrase of phrases) {
        if (phrase === query) {
            score = Math.max(score, 1_500);
            matched = true;
        } else if (phrase.startsWith(query)) {
            score = Math.max(score, 720);
            matched = true;
        } else if (phrase.includes(query)) {
            score = Math.max(score, 480);
            matched = true;
        }
    }

    return { score, labels: matched ? [label] : [] };
}

function bestTermMatch(queryTerm: string, searchableTerms: readonly string[]): number {
    let bestScore = 0;

    for (const candidate of searchableTerms) {
        if (candidate === queryTerm) {
            bestScore = Math.max(bestScore, 320);
            continue;
        }

        if (candidate.startsWith(queryTerm) || queryTerm.startsWith(candidate)) {
            bestScore = Math.max(bestScore, 230);
            continue;
        }

        if (candidate.includes(queryTerm)) {
            bestScore = Math.max(bestScore, 160);
            continue;
        }

        const maximumDistance = queryTerm.length >= 8 ? 2 : queryTerm.length >= 4 ? 1 : 0;
        if (maximumDistance > 0) {
            const distance = boundedLevenshtein(queryTerm, candidate, maximumDistance);
            if (distance <= maximumDistance) {
                bestScore = Math.max(bestScore, 150 - distance * 35);
            }
        }
    }

    return bestScore;
}

function boundedLevenshtein(left: string, right: string, maximumDistance: number): number {
    if (Math.abs(left.length - right.length) > maximumDistance) {
        return maximumDistance + 1;
    }

    let previousRow = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        const currentRow = [leftIndex];

        for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
            const insertion = currentRow[rightIndex - 1] + 1;
            const deletion = previousRow[rightIndex] + 1;
            const substitution = previousRow[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
            const nextValue = Math.min(insertion, deletion, substitution);
            currentRow.push(nextValue);
        }

        previousRow = currentRow;
    }

    return previousRow[right.length];
}

function unique(values: readonly string[]): string[] {
    return [...new Set(values)];
}
