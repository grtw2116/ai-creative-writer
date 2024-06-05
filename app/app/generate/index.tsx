import {
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCallback, useRef, useState } from "react";
import {
  Check,
  ChevronsRight,
  Pause,
  Play,
  Redo,
  Trash2,
  Undo,
} from "lucide-react-native";
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { PopupMenu } from "./components/popupMenu";
import useUndo from "use-undo";
import { Entry } from "@/types";
import { useSpeech } from "@/hooks/useSpeech";
import { IconButton } from "@/components/IconButton";
import { useStorage } from "@/hooks/useStorage";

export default function GenerateScreen() {
  const HOST = `http://${process.env.EXPO_PUBLIC_DEFAULT_HOST_IP_ADDRESS}:${process.env.EXPO_PUBLIC_DEFAULT_HOST_PORT}`;

  const speech = useSpeech();
  const { uniqueKey } = useLocalSearchParams();
  const { loadEntry, saveEntry } = useStorage();

  const [newText, setNewText] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [ttsMode, setTtsMode] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [entry, setEntry] = useState<Entry>({
    title: "",
    genres: [],
    summary: "",
    text: "",
    context: "",
    options: { model: "vecteus", contextLength: 8, predictionLength: 8 },
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const newTextRef = useRef<string>("");

  const [
    textState,
    { set: setText, undo: undoText, redo: redoText, canUndo, canRedo },
  ] = useUndo("");

  const { present: presentText } = textState;

  const translateYAnim = useRef(new Animated.Value(40)).current;

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const key = uniqueKey as string;
        const entry = await loadEntry(key);

        setText(entry.text);
        setEntry(entry);
      };

      loadEntries();
    }, []),
  );

  const updateText = async (text: string) => {
    setText(text);

    const key = uniqueKey as string;
    const entryToSave: Entry = {
      ...entry,
      text: text,
    };

    await saveEntry(key, entryToSave);
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

  const makePrompt = (text: string) => {
    const titleText = entry.title ? `タイトル：${entry.title}\n` : "";
    const genreText = entry.genres.length
      ? `ジャンル：${entry.genres.map((genre) => genre.label).join(", ")}\n`
      : "";
    const summaryText = entry.summary ? `あらすじ：${entry.summary}\n` : "";
    const contextText = entry.context ? `設定：${entry.context}\n` : "";
    const divider = "---\n";

    return `${titleText}${genreText}${summaryText}${contextText}${divider}${text}`;
  };

  const generateNovel = async (prompt: string) => {
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
          model: entry.options.model,
          prompt: prompt,
          stream: true,
          options: {
            num_ctx: Math.pow(2, entry.options.contextLength),
            num_predict: Math.pow(2, entry.options.predictionLength),
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
                onPressTTSButton={() => setTtsMode((prev) => !prev)}
              />
            ),
        }}
      />
      <ScrollView ref={scrollViewRef} style={styles.textContainer}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.summary}>{entry.summary}</Text>
        <View style={styles.divider} />
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
          >{`${currentProgress} / ${Math.pow(2, entry.options.predictionLength)}`}</Text>
        </Animated.View>
      )}
      {ttsMode && (
        <View style={styles.ttsContainer}>
          <IconButton
            icon={Play}
            onPress={() => speech.speak(presentText)}
            disabled={presentText === "" || isGenerating}
          />
          <IconButton
            icon={Pause}
            onPress={() => speech.stop()}
            disabled={presentText === "" || isGenerating}
          />
        </View>
      )}
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <IconButton icon={Trash2} onPress={() => setEditingText("")} />
            <IconButton
              icon={Check}
              onPress={() => {
                updateText(editingText);
                setIsEditing(false);
              }}
            />
          </>
        ) : (
          <>
            <IconButton
              icon={Undo}
              onPress={undoText}
              disabled={!canUndo || isGenerating}
            />
            <IconButton
              icon={Redo}
              onPress={redoText}
              disabled={!canRedo || isGenerating}
              style={{ flexGrow: 1 }}
            />
            <IconButton
              icon={ChevronsRight}
              onPress={() => {
                const prompt = makePrompt(presentText);
                console.log(prompt);
                generateNovel(prompt);
              }}
              disabled={isGenerating || isEditing}
              isLoading={isGenerating}
              color="#FAF9F6"
              style={styles.generateButton}
            />
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
    padding: 16,
    backgroundColor: "#FAF9F6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
  },
  summary: {
    color: "#999",
    fontSize: 14,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  text: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    lineHeight: 36,
    color: "#333",
  },
  newText: {
    fontFamily: Platform.OS === "ios" ? "Hiragino Mincho ProN" : "serif",
    fontSize: 18,
    lineHeight: 36,
    fontWeight: "bold",
    padding: 15,
  },
  ttsContainer: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#dddddd",
    backgroundColor: "#F2F1F1",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    gap: 30,
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
    gap: 30,
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
    backgroundColor: "#404040",
  },
});
