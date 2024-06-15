import { StorySettings } from "@/components/StorySettings";
import { useStorage } from "@/hooks/useStorage";
import { Entry } from "@/types";
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Check } from "lucide-react-native";
import { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function StorySettingsModal() {
  const { loadEntry, saveEntry } = useStorage();
  const params = useLocalSearchParams();
  const [entry, setEntry] = useState<Entry | null>(null);
  const key = params.key as string;

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const entry = await loadEntry(key);
        setEntry(entry);
      };

      loadEntries();
    }, []),
  );

  return (
    <SafeAreaView>
      <Stack.Screen
        options={{
          title: "設定を編集",
          headerRight: () => (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={async () => {
                if (!entry) {
                  return;
                }
                await saveEntry(key, entry);
                router.back();
              }}
            >
              <Check size={24} color="#404040" />
            </TouchableOpacity>
          ),
        }}
      />
      {entry && <StorySettings entry={entry} onUpdateEntry={setEntry} />}
      {!entry && <Text>Loading...</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  doneButton: {
    padding: 8,
  },
});
