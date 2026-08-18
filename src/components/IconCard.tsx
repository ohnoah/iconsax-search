import * as React from "react";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Heart, HeartTick } from "iconsax-react";
import type { IconSearchResult } from "../search/searchIcons";
import type { IconVariant } from "../uiTypes";
import { IconsaxGlyph } from "./IconsaxGlyph";

type IconCardProps = {
    color: string;
    isFavorite: boolean;
    result: IconSearchResult;
    size: number;
    variant: IconVariant;
    onOpen: (result: IconSearchResult) => void;
    onToggleFavorite: (name: string) => void;
};

export function IconCard({ color, isFavorite, result, size, variant, onOpen, onToggleFavorite }: IconCardProps) {
    const { entry, matchedTerms } = result;

    return (
        <Box
            component="article"
            tabIndex={0}
            role="button"
            aria-label={`Open ${entry.name} icon details`}
            onClick={() => onOpen(result)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(result);
                }
            }}
            sx={{
                position: "relative",
                minWidth: 0,
                minHeight: 190,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 2,
                overflow: "hidden",
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
                cursor: "pointer",
                transition: "transform 160ms ease, border-color 160ms ease, background-color 160ms ease",
                contentVisibility: "auto",
                containIntrinsicSize: "190px",
                "&:hover, &:focus-visible": {
                    outline: "none",
                    transform: "translateY(-3px)",
                    borderColor: "primary.dark",
                    bgcolor: "background.paper",
                    boxShadow: 8,
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Chip
                    size="small"
                    label={entry.category}
                    sx={{ maxWidth: "calc(100% - 2.5rem)", bgcolor: "action.hover", color: "text.secondary" }}
                />
                <Tooltip title={isFavorite ? "Remove favorite" : "Save favorite"}>
                    <IconButton
                        size="small"
                        aria-label={isFavorite ? `Remove ${entry.name} from favorites` : `Add ${entry.name} to favorites`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleFavorite(entry.name);
                        }}
                        color={isFavorite ? "primary" : "default"}
                    >
                        {isFavorite ? <HeartTick size={19} /> : <Heart size={19} />}
                    </IconButton>
                </Tooltip>
            </Stack>

            <Box sx={{ display: "grid", placeItems: "center", minHeight: 78 }}>
                <IconsaxGlyph name={entry.name} size={size} variant={variant} color={color} aria-hidden="true" />
            </Box>

            <Stack spacing={0.5} minWidth={0}>
                <Typography fontWeight={700} noWrap title={entry.name}>
                    {entry.name}
                </Typography>
                {matchedTerms.length > 0 ? (
                    <Typography variant="caption" color="text.secondary" noWrap title={matchedTerms.join(", ")}>
                        Matched {matchedTerms.slice(0, 3).join(" · ")}
                    </Typography>
                ) : (
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {entry.aliases.slice(0, 3).join(" · ") || "Iconsax React"}
                    </Typography>
                )}
            </Stack>
        </Box>
    );
}
