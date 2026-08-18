import { alpha, createTheme } from "@mui/material/styles";

const colors = {
    background: "#F8F9FB",
    paper: "#FFFFFF",
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    text: "#17191C",
    textMuted: "#69707D",
    divider: "#E2E5EA",
    icon: "#20242A",
    slate: "#64748B",
    red: "#DC2626",
    green: "#15803D",
    white: "#FFFFFF",
} as const;

export const appTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: colors.primary,
            dark: colors.primaryDark,
            contrastText: colors.white,
        },
        background: {
            default: colors.background,
            paper: colors.paper,
        },
        text: {
            primary: colors.text,
            secondary: colors.textMuted,
        },
        divider: colors.divider,
        error: { main: colors.red },
        success: { main: colors.green },
    },
    typography: {
        fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h2: {
            fontSize: "1rem",
            fontWeight: 650,
            letterSpacing: "-0.01em",
        },
        button: {
            fontWeight: 600,
            textTransform: "none",
        },
        body1: {
            lineHeight: 1.5,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                "*": { boxSizing: "border-box" },
                html: { scrollBehavior: "smooth" },
                body: {
                    minWidth: 320,
                    minHeight: "100vh",
                },
                "::selection": {
                    backgroundColor: alpha(colors.primary, 0.16),
                    color: colors.text,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                    boxShadow: "none",
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 550,
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: false,
            },
        },
    },
});

export const previewColors = [
    { label: "Ink", value: colors.icon },
    { label: "Blue", value: colors.primary },
    { label: "Slate", value: colors.slate },
    { label: "Red", value: colors.red },
    { label: "Green", value: colors.green },
] as const;
