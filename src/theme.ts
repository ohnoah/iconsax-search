import { alpha, createTheme } from "@mui/material/styles";

const colors = {
    background: "#07111F",
    paper: "#0D1A2B",
    paperRaised: "#112238",
    paperSoft: "#142840",
    primary: "#71E0C2",
    primaryDark: "#3AAE94",
    primarySoft: "#163E3A",
    secondary: "#8EAEFF",
    text: "#F5F8FF",
    textMuted: "#A9B8CD",
    divider: "#263950",
    error: "#FF8179",
    warning: "#FFC56E",
    success: "#71E0C2",
    info: "#8EAEFF",
    black: "#000000",
    white: "#FFFFFF",
} as const;

export const appTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: colors.primary,
            dark: colors.primaryDark,
            contrastText: colors.background,
        },
        secondary: {
            main: colors.secondary,
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
        error: { main: colors.error },
        warning: { main: colors.warning },
        success: { main: colors.success },
        info: { main: colors.info },
    },
    typography: {
        fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h1: {
            fontSize: "clamp(2.25rem, 5vw, 4.75rem)",
            fontWeight: 730,
            letterSpacing: "-0.055em",
            lineHeight: 0.98,
        },
        h2: {
            fontSize: "1.45rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
        },
        button: {
            fontWeight: 650,
            textTransform: "none",
        },
        body1: {
            lineHeight: 1.6,
        },
    },
    shape: {
        borderRadius: 14,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                "*": { boxSizing: "border-box" },
                html: { scrollBehavior: "smooth" },
                body: {
                    minWidth: 320,
                    minHeight: "100vh",
                    backgroundImage: `radial-gradient(circle at 16% -5%, ${alpha(colors.secondary, 0.13)}, transparent 30rem), radial-gradient(circle at 88% 5%, ${alpha(colors.primary, 0.11)}, transparent 28rem)`,
                },
                "::selection": {
                    backgroundColor: alpha(colors.primary, 0.28),
                    color: colors.white,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },
        MuiTooltip: {
            defaultProps: {
                arrow: true,
            },
        },
    },
});

export const previewColors = [
    { label: "Mint", value: colors.primary },
    { label: "White", value: colors.text },
    { label: "Blue", value: colors.secondary },
    { label: "Coral", value: colors.error },
    { label: "Amber", value: colors.warning },
] as const;

export const surfaceColors = colors;
