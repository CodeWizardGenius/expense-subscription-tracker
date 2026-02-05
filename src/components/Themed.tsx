import {
    Text as DefaultText,
    TextInput as DefaultTextInput,
    View as DefaultView,
    TextInputProps,
    useColorScheme
} from 'react-native';

// Renk paleti (İleride burayı merkezi bir yerden yönetebilirsiniz)
const Colors = {
    light: {
        text: '#0f172a', // slate-900
        background: '#ffffff',
        border: '#d1d5db', // gray-300
        placeholder: '#94a3b8', // slate-400
    },
    dark: {
        text: '#f8fafc', // slate-50
        background: '#0f172a', // slate-900
        border: '#334155', // slate-700
        placeholder: '#64748b', // slate-500
    },
};

export function Text(props: DefaultText['props']) {
    const { style, ...otherProps } = props;
    const theme = useColorScheme() ?? 'light';

    return (
        <DefaultText
            style={[{ color: Colors[theme].text }, style]}
            {...otherProps}
        />
    );
}

export function View(props: DefaultView['props']) {
    const { style, ...otherProps } = props;
    const theme = useColorScheme() ?? 'light';

    return (
        <DefaultView
            style={[{ backgroundColor: Colors[theme].background }, style]}
            {...otherProps}
        />
    );
}

export function TextInput(props: TextInputProps) {
    const { style, ...otherProps } = props;
    const theme = useColorScheme() ?? 'light';

    return (
        <DefaultTextInput
            placeholderTextColor={Colors[theme].placeholder}
            style={[
                {
                    color: Colors[theme].text,
                    borderColor: Colors[theme].border,
                    backgroundColor: Colors[theme].background
                },
                style
            ]}
            {...otherProps}
        />
    );
}
