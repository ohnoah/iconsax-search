import * as React from "react";
import {
    Box,
    Button,
    ButtonGroup,
    FormControl,
    MenuItem,
    Select,
    Slider,
    Stack,
    Tooltip,
    Typography,
    type SelectChangeEvent,
} from "@mui/material";
import { ICON_CATEGORIES, ICON_VARIANTS } from "../catalog/iconCatalog.generated";
import { previewColors } from "../theme";
import type { IconVariant } from "../uiTypes";

type PreviewControlsProps = {
    category: string;
    color: string;
    size: number;
    variant: IconVariant;
    onCategoryChange: (category: string) => void;
    onColorChange: (color: string) => void;
    onSizeChange: (size: number) => void;
    onVariantChange: (variant: IconVariant) => void;
};

export function PreviewControls({
    category,
    color,
    size,
    variant,
    onCategoryChange,
    onColorChange,
    onSizeChange,
    onVariantChange,
}: PreviewControlsProps) {
    const handleCategoryChange = (event: SelectChangeEvent) => {
        onCategoryChange(event.target.value);
    };

    const handleSizeChange = (_event: Event, value: number | number[]) => {
        if (typeof value === "number") {
            onSizeChange(value);
        }
    };

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "minmax(13rem, 1fr) minmax(20rem, 2fr) minmax(12rem, 0.8fr)" },
                alignItems: "end",
                gap: 2,
                p: { xs: 2, sm: 2.5 },
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
            }}
        >
            <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Category
                </Typography>
                <FormControl size="small" fullWidth>
                    <Select value={category} onChange={handleCategoryChange} aria-label="Filter by category">
                        <MenuItem value="">All categories</MenuItem>
                        {ICON_CATEGORIES.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Style
                </Typography>
                <ButtonGroup size="small" aria-label="Icon style" sx={{ overflowX: "auto", alignSelf: "stretch" }}>
                    {ICON_VARIANTS.map((option) => (
                        <Button
                            key={option}
                            variant={variant === option ? "contained" : "outlined"}
                            onClick={() => onVariantChange(option)}
                            sx={{ flex: 1, minWidth: "max-content" }}
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
            </Stack>

            <Stack spacing={0.25}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Size
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {size}px
                    </Typography>
                </Stack>
                <Slider
                    value={size}
                    onChange={handleSizeChange}
                    min={16}
                    max={64}
                    step={2}
                    valueLabelDisplay="auto"
                    aria-label="Preview icon size"
                />
            </Stack>

            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                <Stack direction="row" spacing={0.25}>
                    {previewColors.map((option) => (
                        <Tooltip key={option.value} title={option.label}>
                            <Button
                                aria-label={`Use ${option.label.toLowerCase()} icons`}
                                onClick={() => onColorChange(option.value)}
                                sx={{ minWidth: 34, width: 34, height: 34, p: 0, borderRadius: "50%" }}
                            >
                                <Box
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        bgcolor: option.value,
                                        border: 1,
                                        borderColor: color === option.value ? "primary.main" : "divider",
                                        boxShadow: color === option.value ? 3 : 0,
                                    }}
                                />
                            </Button>
                        </Tooltip>
                    ))}
                </Stack>
            </Stack>
        </Box>
    );
}
