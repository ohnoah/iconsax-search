import * as React from "react";
import type { Icon, IconProps } from "iconsax-react";
import { iconRegistry } from "../catalog/iconRegistry.generated";

const icons: Readonly<Partial<Record<string, Icon>>> = iconRegistry;

type IconsaxGlyphProps = Omit<IconProps, "ref"> & {
    name: string;
    svgRef?: React.Ref<SVGSVGElement>;
};

export function IconsaxGlyph({ name, svgRef, ...props }: IconsaxGlyphProps) {
    const Glyph = icons[name];

    if (Glyph == null) {
        return null;
    }

    return <Glyph {...props} ref={svgRef} />;
}
