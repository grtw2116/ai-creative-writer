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
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronsRight, Redo, Trash2, Undo } from "lucide-react-native";
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { PopupMenu } from "./components/popupMenu";
import useUndo from "use-undo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entry } from "@/types";

export default function GeneratePage() {
  const HOST = "http://192.168.10.101:11434";
  const MODEL = "vecteus";
  const NUM_CONTEXT = 18384;
  const NUM_PREDICT = 128;

  const { uniqueKey } = useLocalSearchParams();
  const [newText, setNewText] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const newTextRef = useRef<string>("");
  const [title, setTitle] = useState<string>("");
  const [context, setContext] = useState<string>("");

  const [
    textState,
    { set: setText, undo: undoText, redo: redoText, canUndo, canRedo },
  ] = useUndo("");

  const { present: presentText } = textState;

  const translateYAnim = useRef(new Animated.Value(40)).current;

  // 読み込む
  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const value = await AsyncStorage.getItem(uniqueKey as string);
        if (!value) throw new Error("データが見つかりませんでした。");
        const entry = JSON.parse(value) as Entry;

        setText(entry.text);
        setTitle(entry.title);
        setContext(entry.context);
      };

      loadEntries();
    }, []),
  );

  // 保存
  const updateText = async (text: string) => {
    setText(text);
    try {
      const key = uniqueKey as string;
      const updatedEntry = {
        title: title,
        text: text,
        context: context,
      };
      const value = JSON.stringify(updatedEntry);
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("データの保存中にエラーが発生しました", e);
    }
  };

  const startSlideUp = () => {
    translateYAnim.setValue(40);
    Animated.timing(translateYAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const startSlideDown = () => {
    Animated.timing(translateYAnim, {
      delay: 1000,
      toValue: 40,
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
          newTextRef.current = newTextRef.current + parsed.response;
          setNewText((prevText) => prevText + parsed.response);
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
      buffer += decoder.decode(value, { stream: !done });

      buffer = processBuffer(buffer);
    }

    // バッファに残った最後の行を処理
    if (buffer.trim()) {
      processLine(buffer);
    }
  };

  const makePrompt = (text: string, context: string) => {
    return `${context}${context && "\n---"}\n${text}`;
  };

  const generateNovel = async (prompt: string) => {
    console.log("prompt", prompt);
    setIsGenerating(true);
    setNewText("");
    startSlideUp(); // Start slide-up animation

    try {
      const response = await fetch(`${HOST}/api/generate`, {
        //@ts-ignore
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
      updateText(presentText + newTextRef.current);
      newTextRef.current = "";
      setNewText("");
      setCurrentProgress(0);
      startSlideDown();
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
                  setEditingText(presentText);
                  setIsEditing(true);
                }}
                onPressMemoryButton={() => router.navigate("memory")}
              />
            ),
        }}
      />
      <ScrollView ref={scrollViewRef} style={styles.textContainer}>
        {isEditing ? (
          <TextInput
            value={editingText}
            placeholder="ここに文章を入力してください。"
            style={styles.text}
            onChangeText={(text) => setEditingText(text)}
            multiline
          />
        ) : (
          <Text style={styles.text}>
            {presentText}
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
              onPress={() => setEditingText("")}
            >
              <Trash2 size={24} color="#404040" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leftButton}
              onPress={() => {
                updateText(editingText);
                setIsEditing(false);
              }}
            >
              <Check size={24} color="#404040" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => undoText()}
              disabled={!canUndo || isGenerating}
              style={styles.leftButton}
            >
              <Undo
                size={24}
                color={!canUndo || isGenerating ? "#B0B0B0" : "#404040"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => redoText()}
              disabled={!canRedo || isGenerating}
              style={{ ...styles.leftButton, flexGrow: 1 }}
            >
              <Redo
                size={24}
                color={!canRedo || isGenerating ? "#B0B0B0" : "#404040"}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity */}
            {/*   onPress={() => { */}
            {/*     undoText(); */}
            {/*     generateNovel(presentText); */}
            {/*   }} */}
            {/*   disabled={isGenerating} */}
            {/*   style={styles.leftButton} */}
            {/* > */}
            {/*   <RefreshCw size={24} color="#404040" /> */}
            {/* </TouchableOpacity> */}
            <TouchableOpacity
              style={{ ...styles.generateButton, backgroundColor: "#404040" }}
              onPress={() => {
                generateNovel(makePrompt(presentText, context as string));
              }}
              disabled={presentText === "" || isGenerating || isEditing}
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
    backgroundColor: "#F2F1F1",
  },
  textContainer: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F1F1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    height: 40,
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
