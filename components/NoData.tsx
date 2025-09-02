import { View, Text, Image } from 'react-native'
import React from 'react'
import { images } from '@/constants'

const NoData = ({title,description}:{title:string,description:string}) => {
  return (
    <View className='flex justify-center items-center gap-2'>
     <Image source={images.notFound}></Image>
     <Text className='text-xl font-bold'>{title}</Text>
     <Text className='text-base text-gray-700'>{description}</Text>
    </View>
  )
}

export default NoData