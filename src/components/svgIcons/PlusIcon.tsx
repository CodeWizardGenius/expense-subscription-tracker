import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
    size?: number;
}

const PlusIcon = ({ size, ...props }: IconProps) => (
    <Svg
        width={size || 28}
        height={size || 28}
        viewBox="0 0 28 28"
        fill="none"
        {...props}
    >
        <Path
            fill={props.color || "#9CA3AF"}
            fillRule="evenodd"
            d="M0 14C0 6.268 6.268 0 14 0s14 6.268 14 14-6.268 14-14 14S0 21.732 0 14ZM14 2.8a11.2 11.2 0 1 0 0 22.4 11.2 11.2 0 0 0 0-22.4Z"
            clipRule="evenodd"
        />
        <Path
            fill={props.color || "#9CA3AF"}
            fillRule="evenodd"
            d="M15.4 7a1.4 1.4 0 1 0-2.8 0v5.6H7a1.4 1.4 0 0 0 0 2.8h5.6V21a1.4 1.4 0 1 0 2.8 0v-5.6H21a1.4 1.4 0 1 0 0-2.8h-5.6V7Z"
            clipRule="evenodd"
        />
    </Svg>
)
export default PlusIcon;
