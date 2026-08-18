import * as React from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App } from "./App";
import { appTheme } from "./theme";

const rootElement = document.getElementById("root");

if (rootElement == null) {
    throw new Error("Missing root element");
}

createRoot(rootElement).render(
    <React.StrictMode>
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
