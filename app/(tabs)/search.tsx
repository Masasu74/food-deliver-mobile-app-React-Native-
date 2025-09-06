import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import NoData from "@/components/NoData";
import SearchBar from "@/components/SearchBar";
import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { Category, MenuItem } from "@/type";
import cn from 'clsx';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const search = () => {
  const { category, query, categoryName } = useLocalSearchParams<{
    query: string;
    category: string;
    categoryName: string;
  }>();
  // Memoize params to prevent unnecessary re-renders
  const menuParams = useMemo(() => ({
    category: category || "",
    query: query || "",
    limit: 6,
  }), [category, query]);

  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: menuParams,
  });
  const { data: categories } = useAppwrite({ fn: getCategories });

  // Function to find category ID from name
  const getCategoryIdFromName = (name: string) => {
    if (!categories || !name) return null;
    const foundCategory = categories.find(cat => cat.name === name);
    return foundCategory?.$id || null;
  };

  useEffect(() => {
    // Auto-select filter when categoryName is provided
    if (categoryName && !category) {
      const categoryId = getCategoryIdFromName(categoryName);
      if (categoryId) {
        // Set the category parameter to select the filter
        router.setParams({ category: categoryId, categoryName: undefined });
      }
    }
  }, [categoryName, category, categories]);

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const isFirstRightColItem=index%2===0;
           
          return (
            <View className={cn("flex-1 max-w-[48%]",!isFirstRightColItem ? 'mt-10':'mt-0')}>
              <MenuCard item={item as unknown as MenuItem}/>
            </View>
          );
        }}
        keyExtractor={Item =>Item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={()=>(
          <View className="my-5 gap-5">
              <View className="flex-between flex-row w-full">
                <View className="flex-start">
                  <Text className="small-bold uppercase text-primary">Search</Text>
                  <View className="flex-start flex-row gap-x-1 mt-0.5">
                    <Text className="paragraph-semibold text-dark-100">Find your favorite food</Text>
                  </View>
                </View>
                <CartButton/>
              </View>
            <SearchBar/>
              <Filter categories={categories as unknown as Category[]}/>
          </View>
        )}
        ListEmptyComponent={()=>!loading && <NoData title="Nothing matched your search" description="Try a different search term or check for typos."/>}
      />
    </SafeAreaView>
  );
};

export default search;
