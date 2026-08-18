import * as React from "react";
import {
    Box,
    Button,
    Container,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Heart, SearchNormal1 } from "iconsax-react";
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

const PAGE_SIZE = 192;
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

    const resultLabel = favoritesOnly
        ? `${filteredResults.length.toLocaleString()} saved`
        : `${filteredResults.length.toLocaleString()} ${filteredResults.length === 1 ? "icon" : "icons"}`;

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <Box
                component="header"
                sx={{
                    position: { xs: "static", md: "sticky" },
                    top: 0,
                    zIndex: 10,
                    bgcolor: "background.default",
                    borderBottom: 1,
                    borderColor: "divider",
                }}
            >
                <Box sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
                    <Container maxWidth="xl">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 54 }}>
                            <Stack direction="row" alignItems="baseline" spacing={1.25} minWidth={0}>
                                <Typography fontWeight={700} letterSpacing="-0.02em" noWrap>
                                    iconsax-react
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    v{ICON_CATALOG_VERSION} · {iconCatalog.length.toLocaleString()} icons
                                </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Link
                                    href="https://github.com/ohnoah/iconsax-search"
                                    target="_blank"
                                    rel="noreferrer"
                                    underline="hover"
                                    color="text.secondary"
                                    sx={{ display: { xs: "none", sm: "inline" }, px: 1, fontSize: "0.82rem" }}
                                >
                                    GitHub
                                </Link>
                                <Button
                                    size="small"
                                    color="inherit"
                                    variant={favoritesOnly ? "outlined" : "text"}
                                    onClick={() => setFavoritesOnly(!favoritesOnly)}
                                    startIcon={<Heart size={16} />}
                                    aria-pressed={favoritesOnly}
                                    sx={{ color: favoritesOnly ? "primary.main" : "text.secondary" }}
                                >
                                    Saved {favorites.size}
                                </Button>
                            </Stack>
                        </Stack>
                    </Container>
                </Box>

                <Container maxWidth="xl">
                    <TextField
                        inputRef={searchInputRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`Search ${iconCatalog.length.toLocaleString()} icons by name or concept…`}
                        aria-label="Search icons"
                        autoComplete="off"
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchNormal1 size={19} color="currentColor" aria-hidden="true" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Box
                                            component="kbd"
                                            sx={{
                                                display: { xs: "none", sm: "inline-flex" },
                                                minWidth: 24,
                                                height: 22,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: 1,
                                                borderColor: "divider",
                                                borderRadius: 1,
                                                color: "text.secondary",
                                                fontFamily: "inherit",
                                                fontSize: "0.75rem",
                                                bgcolor: "background.default",
                                            }}
                                        >
                                            /
                                        </Box>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={{
                            pt: 1.5,
                            "& .MuiOutlinedInput-root": {
                                minHeight: 44,
                                bgcolor: "background.paper",
                                fontSize: "0.95rem",
                            },
                        }}
                    />

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
                </Container>
            </Box>

            <Container component="main" maxWidth="xl">
                <Stack spacing={1.5} sx={{ py: 2.5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" minHeight={24}>
                        <Typography variant="body2" fontWeight={600}>
                            {resultLabel}
                            {category === "" ? "" : ` · ${category}`}
                        </Typography>
                        {query !== deferredQuery ? (
                            <Typography variant="caption" color="text.secondary">
                                Searching…
                            </Typography>
                        ) : query.trim() !== "" ? (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                Results for “{query.trim()}”
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

            <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", py: 2.5, mt: 2 }}>
                <Container maxWidth="xl">
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                            Unofficial browser for iconsax-react. Search runs locally in your browser.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Link href="https://www.npmjs.com/package/iconsax-react" target="_blank" rel="noreferrer" color="text.secondary" variant="caption">
                                npm
                            </Link>
                            <Link href="https://github.com/rendinjast/iconsax-react" target="_blank" rel="noreferrer" color="text.secondary" variant="caption">
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
