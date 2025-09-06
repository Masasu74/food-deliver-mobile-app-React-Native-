import CustomHeader from '@/components/CustomHeader'
import { images } from '@/constants'
import { EvilIcons, Feather, Fontisto, Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
const profile = () => {
  return (
    <SafeAreaView className='bg-white h-full'>
      <ScrollView 
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className='px-5'>
          <CustomHeader title="Profile" />
          <View className='flex items-center justify-center gap-9 '>
            <TouchableOpacity className='relative'>
              <Image source={images.avatar} className='size-28 rounded-full' />
              <View className='absolute bottom-0 right-0 bg-primary rounded-full p-2'>
                <Feather name="edit-2" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <View className='bg-white w-full p-5 rounded-2xl shadow-md shadow-black/10 flex flex-col gap-7'>
              <View className='flex flex-row items-center gap-5'>
                <View className='bg-[#FE8C001A] p-3 rounded-full'>
                  <Ionicons name="person-outline" size={20} color="#FE8C00" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">Full Name</Text>
                  <Text className='text-md font-medium'>Adrian Hajdin</Text>
                </View>
              </View>
              <View className='flex flex-row items-center gap-5'>
                <View className='bg-[#FE8C001A] p-3 rounded-full'>
                  <Fontisto name="email" size={24} color="#FE8C00" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">Email</Text>
                  <Text className='text-md font-medium'>adrian@jsmastery.com</Text>
                </View>
              </View>
              <View className='flex flex-row items-center gap-5'>
                <View className='bg-[#FE8C001A] p-3 rounded-full'>
                  <Feather name="phone" size={24} color="#FE8C00" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">Phone number</Text>
                  <Text className='text-md font-medium'>+1 555 123 4567</Text>
                </View>
              </View>
              <View className='flex flex-row items-center gap-5'>
                <View className='bg-[#FE8C001A] p-3 rounded-full'>
                  <EvilIcons name="location" size={24} color="#FE8C00" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">Address 1 - (Home)</Text>
                  <Text className='text-md font-medium'>123 Main Street, Springfield, IL 62704</Text>
                </View>
              </View>
              <View className='flex flex-row items-center gap-5'>
                <View className='bg-[#FE8C001A] p-3 rounded-full'>
                  <EvilIcons name="location" size={24} color="#FE8C00" />
                </View>
                <View>
                  <Text className="text-sm text-gray-400">Address 2 - (Work)</Text>
                  <Text className='text-md font-medium'>221B Rose Street, Foodville, FL 12345</Text>
                </View>
              </View>
            </View>
          </View>
          <View className='flex flex-col gap-3 mt-8'>
            <TouchableOpacity className='bg-[#FE8C001A] border border-primary rounded-full p-3 w-full flex flex-row justify-center'>
              <Text className='paragraph-semibold text-primary font-bold'>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className='bg-red-100 border border-red-500 rounded-full p-3 w-full flex flex-row justify-center'>
              <View className='flex flex-row items-center gap-2'>
                <SimpleLineIcons name="logout" size={20} color="red" />
                <Text className='paragraph-semibold text-red-500 font-bold'>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default profile