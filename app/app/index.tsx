import { Link } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

function ListItem({
  id,
  title,
  character,
}: {
  id: number;
  title: string;
  character: number;
}) {
  return (
    <Link href={{ pathname: "generate", params: { id } }} asChild>
      <TouchableOpacity style={styles.listContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.character}>{character + " 文字"}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  listContainer: {
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
});

const data = [
  { id: 0, title: "タイトル1", character: 100 },
  { id: 1, title: "タイトル2", character: 200 },
  { id: 2, title: "タイトル3", character: 300 },
];

export default function IndexPage() {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <ListItem {...item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}
