import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRef, useState } from "react";
import {
  Check,
  ChevronsRight,
  Redo,
  RefreshCw,
  Trash2,
  Undo,
} from "lucide-react-native";
import { Stack } from "expo-router";
import { PopupMenu } from "./components/popupMenu";

export default function GeneratePage() {
  const HOST = "http://192.168.10.101:11434";
  const MODEL = "vecteus";
  const NUM_CONTEXT = 18384;
  const NUM_PREDICT = 256;

  const [text, setText] = useState<string>("吾輩は猫である。");
  const [newText, setNewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const contextRef = useRef<number[]>([]);

  const translateYAnim = useRef(new Animated.Value(100)).current; // Initial position below the button container

  const startSlideUp = () => {
    translateYAnim.setValue(100);
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const startSlideDown = () => {
    Animated.timing(translateYAnim, {
      toValue: 100,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const processLine = (line: string) => {
    if (line.trim()) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
          }
          setNewText((prevText) => prevText + parsed.response);
          setCurrentProgress((prev) => prev + 1);
        }
        if (parsed.done) {
          contextRef.current = parsed.context;
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
      buffer += decoder.decode(value, { stream: !done });

      buffer = processBuffer(buffer);
    }

    // バッファに残った最後の行を処理
    if (buffer.trim()) {
      processLine(buffer);
    }
  };

  const generateNovel = async (prompt: string) => {
    setIsGenerating(true);
    startSlideUp(); // Start slide-up animation

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
      console.error(e);
      Alert.alert(
        "ネットワークエラー",
        "ネットワーク環境を確認の上もう一度お試しください。",
      );
    } finally {
      setCurrentProgress(0);
      startSlideDown(); // Start slide-down animation
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "小説生成",
          headerRight: () =>
            isEditing || (
              <PopupMenu
                onPressEditButton={() => {
                  setNewText("");
                  setText(text + newText);
                  setIsEditing(true);
                }}
              />
            ),
        }}
      />
      <ScrollView ref={scrollViewRef}>
        {isEditing ? (
          <TextInput
            value={text}
            placeholder="ここに文章を入力してください。"
            style={styles.text}
            onChangeText={(text) => setText(text)}
            multiline
          />
        ) : (
          <Text style={styles.text}>
            {text}
            <Text style={styles.newText}>{newText}</Text>
          </Text>
        )}
      </ScrollView>
      {isGenerating && (
        <Animated.View
          style={[
            styles.generatingContainer,
            { transform: [{ translateY: translateYAnim }] },
          ]}
        >
          <ActivityIndicator
            size="small"
            color="#404040"
            animating={isGenerating}
          />
          <Text style={styles.generatingText}>生成中...</Text>
          <Text
            style={styles.progressText}
          >{`${currentProgress} / ${NUM_PREDICT}`}</Text>
        </Animated.View>
      )}
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={styles.leftButton}
              onPress={() => setText("")}
            >
              <Trash2 size={24} color="#404040" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leftButton}
              onPress={() => setIsEditing(false)}
            >
              <Check size={24} color="#404040" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* <TouchableOpacity */}
            {/*   style={styles.leftButton} */}
            {/*   onPress={() => { */}
            {/*     setNewText(""); */}
            {/*     setText((prevText) => prevText + newText); */}
            {/*     setIsEditing(true); */}
            {/*   }} */}
            {/*   disabled={isGenerating} */}
            {/* > */}
            {/*   <Pen size={24} color="#404040" /> */}
            {/* </TouchableOpacity> */}
            {/* <Link href="memory" asChild> */}
            {/*   <TouchableOpacity */}
            {/*     disabled={isGenerating} */}
            {/*     style={styles.leftButton} */}
            {/*   > */}
            {/*     <Book size={24} color="#404040" /> */}
            {/*   </TouchableOpacity> */}
            {/* </Link> */}
            {/* <TouchableOpacity */}
            {/*   onPress={() => {}} */}
            {/*   disabled={isGenerating} */}
            {/*   style={styles.leftButton} */}
            {/* > */}
            {/*   <Speech size={24} color="#404040" /> */}
            {/* </TouchableOpacity> */}
            <TouchableOpacity
              onPress={() => {}}
              disabled={isGenerating}
              style={styles.leftButton}
            >
              <Undo size={24} color="#404040" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {}}
              disabled={isGenerating}
              style={{ ...styles.leftButton, flexGrow: 1 }}
            >
              <Redo size={24} color="#404040" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNewText("");
                generateNovel(text);
              }}
              disabled={isGenerating}
              style={styles.leftButton}
            >
              <RefreshCw size={24} color="#404040" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ ...styles.generateButton, backgroundColor: "#404040" }}
              onPress={() => {
                if (isGenerating) return;
                setNewText("");
                setText((prevText) => prevText + newText);
                generateNovel(text + newText);
              }}
              disabled={text === "" || isGenerating || isEditing}
            >
              <ChevronsRight size={24} color="#FAF9F6" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    lineHeight: 36,
    color: "#333",
    padding: 15,
  },
  newText: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    lineHeight: 36,
    fontWeight: "bold",
    padding: 15,
  },
  generatingContainer: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F1F1",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  generatingText: {
    marginLeft: 10,
    flexGrow: 1,
  },
  buttonContainer: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    backgroundColor: "#F2F1F1",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 20,
  },
  leftButton: {
    padding: 10,
  },
  progressText: {
    fontSize: 12,
    color: "#888",
  },
  generateButton: {
    fontWeight: "bold",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
});
