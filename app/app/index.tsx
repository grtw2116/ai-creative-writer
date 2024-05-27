import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const HOST = "http://192.168.10.101:11434";
  const MODEL = "vecteus";
  const NUM_CONTEXT = 18384;
  const NUM_PREDICT = 512;

  const [text, setText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const processLine = (line: string) => {
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
          setCurrentProgress((prev) => prev + 1);
        }
      } catch (e) {
        console.error("行の解析中にエラーが発生しました", e);
      }
    }
  };

  const processBuffer = (buffer: string) => {
    let lines = buffer.split("\n");
    const remainingBuffer = lines.pop() || ""; // 最後の行は途中かもしれないので保持する

    lines.forEach(processLine);

    return remainingBuffer;
  };

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      throw new Error("小説の生成に失敗しました。もう一度お試しください。");
    }

    if (!response.body) {
      throw new Error(
        "サーバーからの応答がありません。もう一度お試しください。",
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      buffer += decoder.decode(value, { stream: true });

      buffer = processBuffer(buffer);
    }

    // バッファに残った最後の行を処理
    if (buffer.trim()) {
      processLine(buffer);
    }
  };

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

      await handleResponse(response);
    } catch (e) {
      console.error("小説生成中にエラーが発生しました", e);
    } finally {
      setCurrentProgress(0);
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollViewRef}>
        <TextInput
          value={text}
          placeholder="ここに文章を入力してください。"
          style={styles.textInput}
          onChangeText={(text) => setText(text)}
          editable={isEditing}
          multiline
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <Button
              title="完了"
              onPress={() => setIsEditing(false)}
              disabled={isGenerating}
            />
            <Button title="クリア" onPress={() => setText("")} />
          </>
        ) : (
          <>
            <Button
              title="編集"
              onPress={() => setIsEditing(true)}
              disabled={isGenerating}
            />
            <View style={styles.generateButton}>
              {isGenerating && (
                <Text
                  style={styles.progressText}
                >{`${currentProgress} / ${NUM_PREDICT}`}</Text>
              )}
              <ActivityIndicator
                size="small"
                color="#333"
                animating={isGenerating}
              />
              <Button
                title="続きを生成"
                onPress={() => !isGenerating && generateNovel(text)}
                disabled={text === "" || isGenerating || isEditing}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Platform.OS === "ios" ? 20 : 0,
    backgroundColor: "#FAF9F6",
  },
  textInput: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    color: "#333",
    padding: 15,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  editButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  progressText: {
    fontSize: 18,
    color: "#888",
  },
  generateButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
