import { Box, IconButton, Tooltip, Typography } from "@mui/material";
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
    const { entry } = result;

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
                minHeight: 132,
                display: "grid",
                gridTemplateRows: "1fr auto",
                p: 1.25,
                overflow: "hidden",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                cursor: "pointer",
                transition: "border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease",
                contentVisibility: "auto",
                containIntrinsicSize: "132px",
                "&:hover, &:focus-visible": {
                    outline: "none",
                    borderColor: "text.disabled",
                    boxShadow: 1,
                },
                "&:hover .favorite-button, &:focus-within .favorite-button": {
                    opacity: 1,
                },
            }}
        >
            <Tooltip title={isFavorite ? "Remove favorite" : "Save favorite"}>
                <IconButton
                    className="favorite-button"
                    size="small"
                    aria-label={isFavorite ? `Remove ${entry.name} from favorites` : `Add ${entry.name} to favorites`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(entry.name);
                    }}
                    color={isFavorite ? "primary" : "default"}
                    sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 28,
                        height: 28,
                        opacity: isFavorite ? 1 : 0,
                        transition: "opacity 120ms ease",
                        bgcolor: "background.paper",
                    }}
                >
                    {isFavorite ? <HeartTick size={16} /> : <Heart size={16} />}
                </IconButton>
            </Tooltip>

            <Box sx={{ display: "grid", placeItems: "center", minHeight: 82 }}>
                <IconsaxGlyph name={entry.name} size={size} variant={variant} color={color} aria-hidden="true" />
            </Box>

            <Typography
                variant="caption"
                fontWeight={600}
                textAlign="center"
                noWrap
                title={entry.name}
                sx={{ width: "100%", color: "text.secondary" }}
            >
                {entry.name}
            </Typography>
        </Box>
    );
}
