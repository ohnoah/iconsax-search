import * as React from "react";
import {
    Box,
    Button,
    Drawer,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { CloseCircle, Heart, HeartTick, Link21 } from "iconsax-react";
import { ICON_VARIANTS } from "../catalog/iconCatalog.generated";
import type { IconSearchResult } from "../search/searchIcons";
import type { IconVariant } from "../uiTypes";
import { CopyButton } from "./CopyButton";
import { IconsaxGlyph } from "./IconsaxGlyph";

type IconDetailDrawerProps = {
    color: string;
    isFavorite: boolean;
    result: IconSearchResult | null;
    shareUrl: string;
    size: number;
    variant: IconVariant;
    onClose: () => void;
    onToggleFavorite: (name: string) => void;
    onVariantChange: (variant: IconVariant) => void;
};

export function IconDetailDrawer({
    color,
    isFavorite,
    result,
    shareUrl,
    size,
    variant,
    onClose,
    onToggleFavorite,
    onVariantChange,
}: IconDetailDrawerProps) {
    const entry = result?.entry;
    const importSnippet = entry == null ? "" : `import { ${entry.name} } from "iconsax-react";`;
    const usageSnippet =
        entry == null ? "" : `<${entry.name} size={${size}} variant="${variant}" color="${color}" />`;
    const fullSnippet = `${importSnippet}\n\n${usageSnippet}`;

    return (
        <Drawer
            anchor="right"
            open={result != null}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        width: { xs: "100%", sm: 500 },
                        maxWidth: "100%",
                        bgcolor: "background.paper",
                        backgroundImage: "none",
                    },
                },
            }}
        >
            {entry == null ? null : (
                <Stack sx={{ minHeight: "100%" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ position: "sticky", top: 0, zIndex: 2, px: 2.5, py: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
                    >
                        <Box minWidth={0}>
                            <Typography variant="h2" noWrap>
                                {entry.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {entry.category}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title={isFavorite ? "Remove favorite" : "Save favorite"}>
                                <IconButton
                                    color={isFavorite ? "primary" : "default"}
                                    onClick={() => onToggleFavorite(entry.name)}
                                    aria-label={isFavorite ? "Remove favorite" : "Save favorite"}
                                >
                                    {isFavorite ? <HeartTick size={22} /> : <Heart size={22} />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Close">
                                <IconButton onClick={onClose} aria-label="Close icon details">
                                    <CloseCircle size={23} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Stack spacing={2.5} sx={{ p: 2.5 }}>
                        <Box
                            sx={{
                                minHeight: 190,
                                display: "grid",
                                placeItems: "center",
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 2,
                                bgcolor: "action.hover",
                            }}
                        >
                            <IconsaxGlyph
                                key={`${entry.name}-${variant}-${size}-${color}`}
                                name={entry.name}
                                size={Math.max(size * 2, 84)}
                                variant={variant}
                                color={color}
                                aria-label={`${entry.name} ${variant} preview`}
                            />
                        </Box>

                        <Stack spacing={1}>
                            <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                All styles
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0.75 }}>
                                {ICON_VARIANTS.map((option) => (
                                    <Tooltip key={option} title={option}>
                                        <Button
                                            aria-label={`Preview ${option} style`}
                                            aria-pressed={variant === option}
                                            onClick={() => onVariantChange(option)}
                                            sx={{
                                                minWidth: 0,
                                                aspectRatio: "1",
                                                p: 0.75,
                                                border: 1,
                                                borderColor: variant === option ? "primary.main" : "divider",
                                                bgcolor: variant === option ? "action.selected" : "transparent",
                                            }}
                                        >
                                            <IconsaxGlyph name={entry.name} size={28} variant={option} color={color} aria-hidden="true" />
                                        </Button>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Stack>

                        <Stack spacing={1}>
                            <Typography variant="overline" color="text.secondary" fontWeight={700}>
                                Use in code
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    m: 0,
                                    p: 2,
                                    overflowX: "auto",
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 2,
                                    bgcolor: "action.hover",
                                    color: "text.primary",
                                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                                    fontSize: "0.78rem",
                                    lineHeight: 1.65,
                                }}
                            >
                                <code>{fullSnippet}</code>
                            </Box>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <CopyButton text={fullSnippet} label="Copy all" variant="contained" fullWidth />
                                <CopyButton text={importSnippet} label="Copy import" variant="outlined" fullWidth />
                                <CopyButton text={usageSnippet} label="Copy component" variant="outlined" fullWidth />
                            </Stack>
                            <CopyButton
                                text={shareUrl}
                                label="Copy share link"
                                variant="text"
                                startIcon={<Link21 size={17} />}
                                sx={{ alignSelf: "flex-start" }}
                            />
                        </Stack>

                    </Stack>
                </Stack>
            )}
        </Drawer>
    );
}
