import { StorySettings } from "@/components/StorySettings";
import { useStorage } from "@/hooks/useStorage";
import { Entry, Genre } from "@/types";
import { Stack, router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";

const key = new Date().toISOString();

export default function SetupScreen() {
  const initialGenres: Genre[] = [
    { key: "fantasy", label: "ファンタジー", selected: false },
    { key: "scifi", label: "SF", selected: false },
    { key: "mystery", label: "ミステリー", selected: false },
    { key: "romance", label: "恋愛", selected: false },
    { key: "thriller", label: "スリラー", selected: false },
    { key: "horror", label: "ホラー", selected: false },
    { key: "historical", label: "歴史", selected: false },
    { key: "adventure", label: "冒険", selected: false },
    { key: "young adult", label: "ヤングアダルト", selected: false },
    { key: "comedy", label: "コメディ", selected: false },
  ];

  const [newEntry, setNewEntry] = useState<Entry>({
    title: "",
    genres: initialGenres,
    summary: "",
    text: "",
    context: "",
    options: {
      model: "vecteus-v2",
      contextLength: 12,
      predictionLength: 7,
    },
  });
  const { saveEntry } = useStorage();

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          title: "新規作成",
          headerRight: () => (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={async () => {
                await saveEntry(key, newEntry);
                router.replace({
                  pathname: "generate",
                  params: { uniqueKey: key },
                });
              }}
            >
              <Check size={24} color="#404040" />
            </TouchableOpacity>
          ),
        }}
      />
      <StorySettings entry={newEntry} onUpdateEntry={setNewEntry} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  doneButton: {
    padding: 8,
  },
});
