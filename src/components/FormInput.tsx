import React from 'react';
import { Text, TextInput, View } from 'react-native';

interface FormInputProps extends React.ComponentProps<typeof TextInput> {
    label: string;
}

export const FormInput = ({ label, className, ...props }: FormInputProps) => (
    <View className={className}>
        <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">{label}</Text>
        <TextInput
            className="bg-white/5 border border-white/10 text-white p-5 rounded-2xl font-medium"
            placeholderTextColor="#666"
            {...props}
        />
    </View>
);
