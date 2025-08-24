import { View, Text } from 'react-native'
import React from 'react'
import { Redirect, Slot } from 'expo-router'
import useAuthStore from '@/store/auth.store'

const TabLayout = () => {
   const {isAuthenticated}=useAuthStore();
   if(!isAuthenticated){
    return <Redirect href="/sign-in"/>
   } 
  return <Slot/>
}

export default TabLayout