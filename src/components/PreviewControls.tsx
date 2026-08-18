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
        <Stack
            direction="row"
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            gap={1.5}
            sx={{ py: 1.5 }}
        >
            <FormControl size="small" sx={{ width: { xs: "100%", sm: 190 } }}>
                <Select
                    value={category}
                    onChange={handleCategoryChange}
                    aria-label="Filter by category"
                    displayEmpty
                    sx={{ height: 36, bgcolor: "background.paper", fontSize: "0.82rem" }}
                >
                    <MenuItem value="">All categories</MenuItem>
                    {ICON_CATEGORIES.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <ButtonGroup
                size="small"
                aria-label="Icon style"
                sx={{
                    maxWidth: "100%",
                    overflowX: "auto",
                    bgcolor: "background.paper",
                    "& .MuiButton-root": { minWidth: "max-content", px: 1.25, height: 36, fontSize: "0.76rem" },
                }}
            >
                {ICON_VARIANTS.map((option) => (
                    <Button
                        key={option}
                        variant={variant === option ? "contained" : "outlined"}
                        onClick={() => onVariantChange(option)}
                    >
                        {option}
                    </Button>
                ))}
            </ButtonGroup>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ width: { xs: 160, sm: 180 }, ml: { md: "auto" } }}>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
                    {size}px
                </Typography>
                <Slider
                    value={size}
                    onChange={handleSizeChange}
                    min={16}
                    max={64}
                    step={2}
                    size="small"
                    aria-label="Preview icon size"
                />
            </Stack>

            <Stack direction="row" spacing={0.25} alignItems="center">
                {previewColors.map((option) => (
                    <Tooltip key={option.value} title={option.label}>
                        <Button
                            aria-label={`Use ${option.label.toLowerCase()} icons`}
                            onClick={() => onColorChange(option.value)}
                            sx={{ minWidth: 30, width: 30, height: 30, p: 0, borderRadius: "50%" }}
                        >
                            <Box
                                sx={{
                                    width: 17,
                                    height: 17,
                                    borderRadius: "50%",
                                    bgcolor: option.value,
                                    outline: color === option.value ? 2 : 0,
                                    outlineColor: "primary.main",
                                    outlineOffset: 2,
                                }}
                            />
                        </Button>
                    </Tooltip>
                ))}
            </Stack>
        </Stack>
    );
}
