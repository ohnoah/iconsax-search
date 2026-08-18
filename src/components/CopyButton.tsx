import * as React from "react";
import { Button, type ButtonProps } from "@mui/material";
import { Clipboard, ClipboardTick } from "iconsax-react";

type CopyButtonProps = Omit<ButtonProps, "onClick"> & {
    text: string;
    label?: string;
};

export function CopyButton({ text, label = "Copy", ...buttonProps }: CopyButtonProps) {
    const [copied, setCopied] = React.useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
    };

    return (
        <Button
            {...buttonProps}
            onClick={() => void copy()}
            startIcon={copied ? <ClipboardTick size={17} /> : <Clipboard size={17} />}
        >
            {copied ? "Copied" : label}
        </Button>
    );
}
