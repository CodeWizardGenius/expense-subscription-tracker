import { Text, TextInput, View } from '@/src/components/Themed';
import { signInWithEmail } from '@/src/features/auth/login';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Button } from 'react-native';

const Login = () => {


  const [email, setEmail] = useState<string>('tturk753@gmail.com');
  const [password, setPassword] = useState<string>('Password123.');

  const handleLogin = async () => {
    try {
      await signInWithEmail(email, password);
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
        title="Login"
        onPress={handleLogin}
      />



      <Text>
        Don't have an account?
        <Link
          href={"../signup"} >
          <Text className='text-blue-500'> Sign up</Text>
        </Link>
      </Text>
    </View >
  )
}

export default Login;