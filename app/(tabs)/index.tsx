import { Text, View } from '@/src/components/Themed';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';
import React from 'react';
import { Button } from 'react-native';

const Index = () => {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return <Text>Splash Screen</Text>
  }

  // if (!auth.session) {
  //   return <Redirect href={"../login"} />
  // }

  const handleLogout = () => {
    supabase.auth.signOut();
  }

  return (

    <View className='flex-1 items-center justify-center gap-4'>
      <Text>Logged user's email: {auth.session?.user?.email}</Text>
      <Button title="LogOut" onPress={handleLogout}></Button>
    </View>
  )





}

export default Index;