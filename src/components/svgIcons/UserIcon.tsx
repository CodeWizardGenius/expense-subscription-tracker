import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface IconProps extends SvgProps {
    size?: number;
}

const UserIcon = ({ size, ...props }: IconProps) => (
    <Svg
        width={size || 28}
        height={size || 28}
        fill="none"
        {...props}
    >
        <Path
            fill={props.color || "#9CA3AF"}
            fillRule="evenodd"
            d="M6.667 5.778c0-1.533.562-3.002 1.562-4.086C9.229.61 10.586 0 12 0c1.415 0 2.771.609 3.771 1.692 1 1.084 1.562 2.553 1.562 4.086 0 1.532-.562 3.002-1.562 4.085-1 1.084-2.357 1.693-3.771 1.693-1.415 0-2.771-.61-3.771-1.693-1-1.083-1.562-2.553-1.562-4.085Zm0 8.666c-1.768 0-3.464.761-4.714 2.116C.703 17.914 0 19.75 0 21.667c0 1.149.421 2.251 1.172 3.064C1.922 25.544 2.939 26 4 26h16c1.06 0 2.078-.456 2.828-1.27.75-.812 1.172-1.914 1.172-3.063 0-1.916-.702-3.753-1.953-5.107-1.25-1.355-2.946-2.116-4.714-2.116H6.667Z"
            clipRule="evenodd"
        />
    </Svg>
)
export default UserIcon;
