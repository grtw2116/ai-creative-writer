import { Entry } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, Stack, useFocusEffect } from "expo-router";
import { EllipsisVertical, Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function ListItem(entry: Entry) {
  return (
    <Link href={{ pathname: "generate", params: entry }} asChild>
      <TouchableOpacity style={styles.listItemContainer}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.character}>{`${entry.text.length} 文字`}</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function IndexPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  // 起動時にデータを読み込む
  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const keys = await AsyncStorage.getAllKeys();

        console.log("keys", keys);

        const entries = [];
        for (const k of keys) {
          const value = await AsyncStorage.getItem(k);
          console.log("value", value);
          if (!value) continue;
          entries.push(JSON.parse(value));
        }

        console.log("entries", entries);

        setEntries(entries);
      };

      loadEntries();
    }, []),
  );

  return (
    <SafeAreaView style={styles.screenContainer}>
      <Stack.Screen
        options={{
          title: "AI Creative Writer",
          headerRight: () => <EllipsisVertical size={24} color="#404040" />,
        }}
      />
      {entries.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.altText}>右下の「+」から新規作成</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item }) => <ListItem {...item} />}
          keyExtractor={(item) => item.uniqueKey}
        />
      )}
      <Button onPress={() => AsyncStorage.clear()} title="Clear (for debug)" />
      <Link href="setup" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus size={32} color="#fff" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  altText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#B0B0B0",
  },
  listItemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  character: {
    color: "#999999",
    fontSize: 12,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 72,
    height: 72,
    borderRadius: 48,
    backgroundColor: "#404040",
    justifyContent: "center",
    alignItems: "center",
  },
});
