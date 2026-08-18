import * as React from "react";
import {
    Box,
    Button,
    Chip,
    Container,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Heart, Magicpen, SearchNormal1 } from "iconsax-react";
import {
    ICON_CATALOG_VERSION,
    ICON_CATEGORIES,
    ICON_VARIANTS,
    iconCatalog,
} from "./catalog/iconCatalog.generated";
import { IconDetailDrawer } from "./components/IconDetailDrawer";
import { IconGrid } from "./components/IconGrid";
import { PreviewControls } from "./components/PreviewControls";
import { searchIcons, type IconSearchResult } from "./search/searchIcons";
import { previewColors } from "./theme";
import type { IconVariant } from "./uiTypes";

const PAGE_SIZE = 96;
const FAVORITES_STORAGE_KEY = "iconsax-search:favorites";

type InitialState = {
    category: string;
    color: string;
    query: string;
    selectedName: string | null;
    size: number;
    variant: IconVariant;
};

function isIconVariant(value: string | null): value is IconVariant {
    return ICON_VARIANTS.some((variant) => variant === value);
}

function readInitialState(): InitialState {
    const params = new URLSearchParams(window.location.search);
    const requestedVariant = params.get("variant");
    const requestedCategory = params.get("category") ?? "";
    const requestedColor = params.get("color");
    const requestedSize = Number(params.get("size"));
    const requestedName = params.get("icon");

    return {
        category: ICON_CATEGORIES.some((catalogCategory) => catalogCategory === requestedCategory) ? requestedCategory : "",
        color: previewColors.some((option) => option.value === requestedColor)
            ? (requestedColor ?? previewColors[0].value)
            : previewColors[0].value,
        query: params.get("q") ?? "",
        selectedName: iconCatalog.some((entry) => entry.name === requestedName) ? requestedName : null,
        size: Number.isFinite(requestedSize) && requestedSize >= 16 && requestedSize <= 64 ? requestedSize : 32,
        variant: isIconVariant(requestedVariant) ? requestedVariant : "Linear",
    };
}

function readFavorites(): ReadonlySet<string> {
    try {
        const storedValue: unknown = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
        if (!Array.isArray(storedValue)) {
            return new Set();
        }

        return new Set(storedValue.filter((value): value is string => typeof value === "string"));
    } catch {
        return new Set();
    }
}

function buildShareSearch(
    query: string,
    category: string,
    variant: IconVariant,
    size: number,
    color: string,
    selectedName: string | null,
): string {
    const params = new URLSearchParams();
    if (query.trim() !== "") {
        params.set("q", query);
    }
    if (category !== "") {
        params.set("category", category);
    }
    if (variant !== "Linear") {
        params.set("variant", variant);
    }
    if (size !== 32) {
        params.set("size", size.toString());
    }
    if (color !== previewColors[0].value) {
        params.set("color", color);
    }
    if (selectedName != null) {
        params.set("icon", selectedName);
    }

    const search = params.toString();
    return search === "" ? "" : `?${search}`;
}

export function App() {
    const initialState = React.useState(readInitialState)[0];
    const [query, setQuery] = React.useState(initialState.query);
    const [category, setCategory] = React.useState(initialState.category);
    const [variant, setVariant] = React.useState<IconVariant>(initialState.variant);
    const [size, setSize] = React.useState(initialState.size);
    const [color, setColor] = React.useState(initialState.color);
    const [selectedName, setSelectedName] = React.useState<string | null>(initialState.selectedName);
    const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
    const [favorites, setFavorites] = React.useState<ReadonlySet<string>>(readFavorites);
    const [favoritesOnly, setFavoritesOnly] = React.useState(false);
    const deferredQuery = React.useDeferredValue(query);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const shareSearch = buildShareSearch(query, category, variant, size, color, selectedName);
    const shareUrl = `${window.location.origin}${window.location.pathname}${shareSearch}`;

    const searchOptions = category === "" ? {} : { category };
    const rankedResults = searchIcons(iconCatalog, deferredQuery, searchOptions);
    const filteredResults = favoritesOnly
        ? rankedResults.filter((result) => favorites.has(result.entry.name))
        : rankedResults;
    const visibleResults = filteredResults.slice(0, visibleCount);

    let selectedResult: IconSearchResult | null =
        filteredResults.find((result) => result.entry.name === selectedName) ?? null;
    if (selectedResult == null && selectedName != null) {
        const selectedEntry = iconCatalog.find((entry) => entry.name === selectedName);
        if (selectedEntry != null) {
            selectedResult = { entry: selectedEntry, score: 0, matchedTerms: [] };
        }
    }

    React.useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [deferredQuery, category, favoritesOnly]);

    React.useEffect(() => {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
    }, [favorites]);

    React.useEffect(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${shareSearch}`);
    }, [shareSearch]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            const isEditing =
                target instanceof HTMLElement &&
                (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

            if (event.key === "/" && !isEditing) {
                event.preventDefault();
                searchInputRef.current?.focus();
            }

            if (event.key === "Escape" && selectedName != null) {
                setSelectedName(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedName]);

    const toggleFavorite = (name: string) => {
        setFavorites((current) => {
            const next = new Set(current);
            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }
            return next;
        });
    };

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <Box component="header" sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Container maxWidth="xl">
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 68 }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: 2,
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                }}
                            >
                                <Magicpen size={22} variant="Bold" aria-hidden="true" />
                            </Box>
                            <Box>
                                <Typography fontWeight={750} lineHeight={1.1}>
                                    Icon Index
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    for iconsax-react · unofficial explorer
                                </Typography>
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                                size="small"
                                variant="outlined"
                                color="primary"
                                label={`iconsax-react v${ICON_CATALOG_VERSION}`}
                                sx={{ display: { xs: "none", sm: "flex" } }}
                            />
                            <Button
                                size="small"
                                variant={favoritesOnly ? "contained" : "text"}
                                onClick={() => setFavoritesOnly(!favoritesOnly)}
                                startIcon={<Heart size={17} />}
                                aria-pressed={favoritesOnly}
                            >
                                {favorites.size}
                                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 0.5 }}>
                                    saved
                                </Box>
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container component="main" maxWidth="xl">
                <Stack spacing={{ xs: 4, md: 5 }} sx={{ py: { xs: 5, md: 8 } }}>
                    <Stack spacing={2.5} alignItems="center" textAlign="center">
                        <Chip size="small" label={`${iconCatalog.length.toLocaleString()} icons · local fuzzy search`} />
                        <Typography component="h1" variant="h1" maxWidth={880}>
                            Search what you mean.
                            <Box component="span" sx={{ display: "block", color: "primary.main" }}>
                                Find the right icon.
                            </Box>
                        </Typography>
                        <Typography color="text.secondary" maxWidth={690} sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                            Search names, categories, and useful aliases. Everything runs in your browser against the exact installed Iconsax React catalog.
                        </Typography>
                        <TextField
                            inputRef={searchInputRef}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Try “delete”, “presentation”, or “settings”…"
                            aria-label="Search icons"
                            autoComplete="off"
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchNormal1 size={25} color="currentColor" aria-hidden="true" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Box
                                                component="kbd"
                                                sx={{
                                                    display: { xs: "none", sm: "inline-flex" },
                                                    minWidth: 28,
                                                    height: 26,
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    border: 1,
                                                    borderColor: "divider",
                                                    borderRadius: 1,
                                                    color: "text.secondary",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                /
                                            </Box>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            sx={{
                                maxWidth: 820,
                                "& .MuiOutlinedInput-root": {
                                    minHeight: { xs: 62, sm: 72 },
                                    borderRadius: 3,
                                    bgcolor: "background.paper",
                                    boxShadow: 10,
                                    fontSize: { xs: "1rem", sm: "1.12rem" },
                                },
                            }}
                        />
                    </Stack>

                    <PreviewControls
                        category={category}
                        color={color}
                        size={size}
                        variant={variant}
                        onCategoryChange={setCategory}
                        onColorChange={setColor}
                        onSizeChange={setSize}
                        onVariantChange={setVariant}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "baseline" }} justifyContent="space-between" gap={1}>
                        <Box>
                            <Typography variant="h2">
                                {favoritesOnly ? "Saved icons" : query.trim() === "" ? "All icons" : `Results for “${query.trim()}”`}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {filteredResults.length.toLocaleString()} {filteredResults.length === 1 ? "match" : "matches"}
                                {category === "" ? "" : ` in ${category}`}
                            </Typography>
                        </Box>
                        {query !== deferredQuery ? (
                            <Typography variant="caption" color="text.secondary">
                                Searching…
                            </Typography>
                        ) : null}
                    </Stack>

                    <IconGrid
                        color={color}
                        favorites={favorites}
                        results={visibleResults}
                        size={size}
                        totalCount={filteredResults.length}
                        variant={variant}
                        visibleCount={visibleCount}
                        onOpen={(result) => setSelectedName(result.entry.name)}
                        onShowMore={() => setVisibleCount((current) => current + PAGE_SIZE)}
                        onToggleFavorite={toggleFavorite}
                    />
                </Stack>
            </Container>

            <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 3 }}>
                <Container maxWidth="xl">
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                        <Typography variant="body2" color="text.secondary">
                            Unofficial, open-source explorer. Iconsax is a separate project and trademark of its respective owner.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Link href="https://iconsax.io/" target="_blank" rel="noreferrer" color="text.secondary">
                                Iconsax
                            </Link>
                            <Link href="https://github.com/rendinjast/iconsax-react" target="_blank" rel="noreferrer" color="text.secondary">
                                Package source
                            </Link>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <IconDetailDrawer
                color={color}
                isFavorite={selectedName != null && favorites.has(selectedName)}
                result={selectedResult}
                shareUrl={shareUrl}
                size={size}
                variant={variant}
                onClose={() => setSelectedName(null)}
                onToggleFavorite={toggleFavorite}
                onVariantChange={setVariant}
            />
        </Box>
    );
}
