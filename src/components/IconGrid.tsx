import { Box, Button, Stack, Typography } from "@mui/material";
import { SearchStatus } from "iconsax-react";
import type { IconSearchResult } from "../search/searchIcons";
import type { IconVariant } from "../uiTypes";
import { IconCard } from "./IconCard";

type IconGridProps = {
    color: string;
    favorites: ReadonlySet<string>;
    results: readonly IconSearchResult[];
    size: number;
    totalCount: number;
    variant: IconVariant;
    visibleCount: number;
    onOpen: (result: IconSearchResult) => void;
    onShowMore: () => void;
    onToggleFavorite: (name: string) => void;
};

export function IconGrid({
    color,
    favorites,
    results,
    size,
    totalCount,
    variant,
    visibleCount,
    onOpen,
    onShowMore,
    onToggleFavorite,
}: IconGridProps) {
    if (totalCount === 0) {
        return (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 10, textAlign: "center" }}>
                <SearchStatus size={44} color="currentColor" aria-hidden="true" />
                <Typography variant="h2">No icons found</Typography>
                <Typography color="text.secondary" maxWidth={440}>
                    Try a broader concept, clear a filter, or search for a visual idea like “send”, “chart”, or “settings”.
                </Typography>
            </Stack>
        );
    }

    return (
        <>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 11.5rem), 1fr))",
                    gap: { xs: 1.25, sm: 1.75 },
                }}
            >
                {results.map((result) => (
                    <IconCard
                        key={result.entry.name}
                        result={result}
                        color={color}
                        isFavorite={favorites.has(result.entry.name)}
                        size={size}
                        variant={variant}
                        onOpen={onOpen}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </Box>
            {visibleCount < totalCount ? (
                <Stack alignItems="center" sx={{ py: 4 }}>
                    <Button variant="outlined" size="large" onClick={onShowMore}>
                        Show more icons
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Showing {Math.min(visibleCount, totalCount).toLocaleString()} of {totalCount.toLocaleString()}
                    </Typography>
                </Stack>
            ) : null}
        </>
    );
}
