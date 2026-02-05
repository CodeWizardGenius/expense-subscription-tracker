import { Text, TextInput, View } from '@/src/components/Themed';
import { signUpWithEmail } from '@/src/features/auth/signup';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Button } from 'react-native';

const SignUp = () => {

    const [email, setEmail] = useState<string>('tturk753@gmail.com');
    const [password, setPassword] = useState<string>('Password123.');

    const handleSignUp = async () => {
        try {
            const { user, session } = await signUpWithEmail(email, password);
            alert(user?.email + " " + user?.created_at);
        } catch (error) {
            alert(error);
        }
    }

    return (
        <View className='flex-1 items-center justify-center gap-4'>

            {/* email */}
            <TextInput
                className='w-80 h-15 border rounded-md px-2 mb-2'
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />

            {/* password */}
            <TextInput
                className='w-80 h-15 border rounded-md px-2 mb-2'
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />

            <Button
                title="Sign Up"
                onPress={handleSignUp}
            />


            <Text>
                Already have an account?
                <Link
                    asChild
                    href={"/login"}
                >
                    <Text className='text-blue-500'> Login</Text>
                </Link>
            </Text>

        </View >
    )
}

export default SignUp;