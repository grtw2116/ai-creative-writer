import { Stack } from "expo-router";
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { ReadableStream } from "web-streams-polyfill";
import { Platform } from "react-native";
import { EllipsisVertical } from "lucide-react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

polyfillFetch();
polyfillEncoding();
globalThis.ReadableStream = ReadableStream;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#F2F1F1" },
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily:
              Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "AI Creative Writer",
            headerRight: () => <EllipsisVertical size={24} color="#404040" />,
          }}
        />
        <Stack.Screen
          name="generate"
          options={{
            title: "小説生成",
            headerRight: () => <EllipsisVertical size={24} color="#404040" />,
          }}
        />
        <Stack.Screen
          name="memory"
          options={{
            title: "メモリ",
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
