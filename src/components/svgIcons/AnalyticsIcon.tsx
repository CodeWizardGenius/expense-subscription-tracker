import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
    size?: number;
}

const AnalyticsIcon = ({ size, ...props }: IconProps) => (
    <Svg
        width={size || 28}
        height={size || 28}
        viewBox="0 0 22 25"
        fill="none"
        {...props}
    >
        <Path
            fill={props.color || "#9CA3AF"}
            d="M0 24.167V7.25h4.833v16.917H0Zm8.458 0V0h4.834v24.167H8.458Zm8.459 0V14.5h4.833v9.667h-4.833Z"
        />
    </Svg>
)
export default AnalyticsIcon;
