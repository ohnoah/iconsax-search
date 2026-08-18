export interface IconCatalogEntry {
    readonly name: string;
    readonly category: string;
    readonly aliases: readonly string[];
    readonly keywords: readonly string[];
    readonly tokens: readonly string[];
    readonly usedInRepo: boolean;
    readonly usageCount: number;
}

