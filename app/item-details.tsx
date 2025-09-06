import { useLocalSearchParams, router } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "@/store/cart.store";
import { appwriteConfig } from "@/lib/appwrite";
import { images } from "@/constants";

export default function ItemDetails() {
  const { item } = useLocalSearchParams<{
    item: string; // JSON string of the item data
  }>();
  
  const { addItem } = useCartStore();
  
  // Parse the item data
  const itemData = item ? JSON.parse(item) : null;
  
  if (!itemData) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Text>Item not found</Text>
      </SafeAreaView>
    );
  }

  const imageUrl = `${itemData.image_url}?project=${appwriteConfig.projectId}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={images.arrowBack} className="size-6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Item Details</Text>
        <View className="size-6" />
      </View>

      <ScrollView className="flex-1">
        {/* Item Image */}
        <View className="items-center py-5">
          <Image
            source={{ uri: imageUrl }}
            className="size-64"
            resizeMode="contain"
          />
        </View>

        {/* Item Info */}
        <View className="px-5 pb-5">
          <Text className="text-2xl font-bold text-dark-100 mb-2">
            {itemData.name}
          </Text>
          
          <Text className="text-lg text-primary font-semibold mb-4">
            ${itemData.price}
          </Text>

          {itemData.description && (
            <Text className="text-base text-gray-200 mb-4">
              {itemData.description}
            </Text>
          )}

          {itemData.calories && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-dark-100 mb-1">
                Nutrition Info
              </Text>
              <Text className="text-sm text-gray-200">
                Calories: {itemData.calories} | Protein: {itemData.protein}g
              </Text>
            </View>
          )}

          {itemData.rating && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-dark-100 mb-1">
                Rating
              </Text>
              <Text className="text-sm text-gray-200">
                ⭐ {itemData.rating}/5
              </Text>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            className="bg-primary py-4 rounded-lg items-center"
            onPress={() => {
              addItem({
                id: itemData.$id,
                name: itemData.name,
                price: itemData.price,
                image_url: imageUrl,
                customizations: []
              });
              router.back();
            }}
          >
            <Text className="text-white font-bold text-lg">
              Add to Cart - ${itemData.price}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}