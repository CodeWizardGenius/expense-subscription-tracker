import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
    size?: number;
}

const HomeIcon = ({ size, ...props }: IconProps) => (
    <Svg
        width={size || 21}
        height={size || 23}
        fill="none"
        {...props}
    >
        <Path
            fill={props.color || "#9CA3AF"}
            d="M0 20.02V8.397c0-.41.092-.797.275-1.163.184-.366.436-.667.758-.904L8.783.517A2.49 2.49 0 0 1 10.333 0a2.49 2.49 0 0 1 1.55.517l7.75 5.812c.323.237.576.538.76.904.183.366.274.754.274 1.163V20.02a2.49 2.49 0 0 1-.76 1.825 2.483 2.483 0 0 1-1.824.758h-3.875c-.366 0-.672-.124-.92-.372a1.256 1.256 0 0 1-.371-.92v-6.458c0-.366-.124-.672-.372-.92a1.256 1.256 0 0 0-.92-.371H9.042c-.366 0-.673.123-.92.371a1.256 1.256 0 0 0-.372.92v6.459c0 .366-.124.672-.372.92a1.245 1.245 0 0 1-.92.371H2.583c-.71 0-1.318-.253-1.824-.758A2.493 2.493 0 0 1 0 20.021Z"
        />
    </Svg>
)
export default HomeIcon;
