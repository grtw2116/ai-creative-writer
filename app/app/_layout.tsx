import { Stack } from "expo-router";
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { ReadableStream } from "web-streams-polyfill";

polyfillFetch();
polyfillEncoding();
globalThis.ReadableStream = ReadableStream;

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "小説生成" }} />
    </Stack>
  );
}
