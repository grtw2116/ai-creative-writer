import { useStorage } from "@/hooks/useStorage";
import { KeyedEntry } from "@/types";
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

function ListItem({ item }: { item: KeyedEntry }) {
  return (
    <Link
      href={{ pathname: "generate", params: { uniqueKey: item.key } }}
      asChild
    >
      <TouchableOpacity style={styles.listItemContainer}>
        <Text style={styles.title}>{item.entry.title}</Text>
        <Text style={styles.character}>{`${item.entry.text.length} 文字`}</Text>
      </TouchableOpacity>
    </Link>
  );
}

export default function MainScreen() {
  const [list, setList] = useState<KeyedEntry[]>([]);
  const { loadAllEntries } = useStorage();

  // 起動時にデータを読み込む
  useFocusEffect(
    useCallback(() => {
      const loadAndSetEntries = async () => {
        const entries = await loadAllEntries();
        setList(entries);
      };
      loadAndSetEntries();
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
      {list.length === 0 ? (
        <View style={styles.container}>
          <Text style={styles.altText}>右下の「+」から新規作成</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          renderItem={({ item }) => <ListItem item={item} />}
          keyExtractor={(item) => item.key}
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
    width: 64,
    height: 64,
    borderRadius: 48,
    backgroundColor: "#404040",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
