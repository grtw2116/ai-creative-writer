import { Stack } from "expo-router";
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { ReadableStream } from "web-streams-polyfill";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProvider } from "react-native-popup-menu";

polyfillFetch();
polyfillEncoding();
globalThis.ReadableStream = ReadableStream;

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MenuProvider>
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
        />
      </MenuProvider>
    </SafeAreaProvider>
  );
}
