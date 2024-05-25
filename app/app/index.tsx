import { useRef, useState } from "react";
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

export default function Index() {
  const HOST = "http://192.168.10.101:11434";
  const MODEL = "vecteus";
  const NUM_CONTEXT = 18384;
  const NUM_PREDICT = 512;

  const TEMPLATE = `「これってもしかして...」「俺たち...」「私たち...」「入れ替わってる〜！？」`;

  const [text, setText] = useState<string>(TEMPLATE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const generateNovel = async (prompt: string) => {
    setIsGenerating(true);

    try {
      const response = await fetch(`${HOST}/api/generate`, {
        reactNative: {
          textStreaming: true,
        },
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: prompt,
          stream: true,
          options: {
            num_ctx: NUM_CONTEXT,
            num_predict: NUM_PREDICT,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate novel");
      }

      if (!response.body) {
        throw new Error("Missing body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        buffer += decoder.decode(value, { stream: true });

        let lines = buffer.split("\n");
        buffer = lines.pop(); // 最後の行は途中かもしれないので保持する

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                setText((prevText) => {
                  const newText = prevText + parsed.response;
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: false });
                  }
                  return newText;
                });
              }
            } catch (e) {
              console.error("Error parsing line", e);
            }
          }
        }
      }

      // バッファに残った最後の行を処理
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.response && parsed.response > 0) {
            setText((prevText) => {
              const newText = prevText + parsed.response;
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: false });
              }
              return newText;
            });
          }
        } catch (e) {
          console.error("Error parsing line", e);
        }
      }
    } catch (e) {
      console.error("Error generating novel", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef}>
        <Text style={styles.text}>{text}</Text>
      </ScrollView>
      <Button title="クリア" onPress={() => setText(TEMPLATE)} />
      <Button
        title="小説を生成"
        onPress={() => !isGenerating && generateNovel(text)}
        disabled={isGenerating}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 20,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    lineHeight: 50,
  },
});
