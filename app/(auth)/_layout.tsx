import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";

const _layout = () => {
  return (
    <SafeAreaView>
      <View>
        <Text>Auth layout</Text>
      </View>
      <Slot/>
    </SafeAreaView>
  );
};

export default _layout;
