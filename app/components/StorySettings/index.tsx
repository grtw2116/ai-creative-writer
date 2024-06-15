import { Entry, Genre } from "@/types";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OptionItemContainer } from "@/components/StorySettings/components/OptionItemContainer";
import { GenreOption } from "@/components/StorySettings/components/GenreOption";
import { useFocusEffect } from "expo-router";

const titlePlaceholder = "吾輩は猫である";
const textPlaceholder = `ある日、生まれたばかりの猫が捨てられ、苦沙弥先生の家に住みつきます。苦沙弥先生は中学校の英語教師で、厳格で少し気難しい性格です。猫は新しい家に住みつき、人間たちの生活を観察し始めます。苦沙弥先生の家には、妻と娘たちが住んでおり、猫は彼らの日常を眺めるのが好きです。特に、苦沙弥先生の友人である寒月と迷亭が訪れるときの会話に興味を持ちます。`;
const contextPlaceholder = `吾輩（猫）: 主人公であり、語り手の猫。苦沙弥先生の家に住みつき、人間たちの生活を観察する。
苦沙弥先生: 中学校の英語教師で、猫の飼い主。厳格で少し気難しい性格。
寒月: 苦沙弥先生の友人。真面目で誠実な人物。
迷亭: 苦沙弥先生の友人。皮肉屋で冗談が好き。`;

export function StorySettings({
  entry,
  onUpdateEntry: setEntry,
}: {
  entry: Entry;
  onUpdateEntry: (entry: Entry) => void;
}) {
  return (
    <SafeAreaView>
      <ScrollView style={styles.optionContainer}>
        <Text style={styles.h2}>物語設定</Text>
        <OptionItemContainer title="タイトル">
          <TextInput
            style={styles.titleInput}
            value={entry.title}
            onChangeText={(text) => setEntry({ ...entry, title: text })}
            placeholder={titlePlaceholder}
          />
        </OptionItemContainer>
        <OptionItemContainer title="ジャンル">
          <View style={styles.genreContainer}>
            {entry.genres.map((genre) => (
              <GenreOption
                key={genre.key}
                label={genre.label}
                selected={genre.selected}
                onPress={(_e) => {
                  setEntry({
                    ...entry,
                    genres: entry.genres.map((g) => {
                      if (g.key === genre.key) {
                        return { ...g, selected: !g.selected };
                      }
                      return g;
                    }),
                  });
                }}
              />
            ))}
          </View>
        </OptionItemContainer>
        <OptionItemContainer title="あらすじ">
          <TextInput
            style={styles.textArea}
            value={entry.summary}
            onChangeText={(text) => setEntry({ ...entry, summary: text })}
            placeholder={textPlaceholder}
            multiline
          />
          <Text style={styles.tips}>
            あらすじに基づいてAIが物語を生成します。
            ここに入力された文章は、生成時にプロンプトの先頭に追加されます。
          </Text>
        </OptionItemContainer>
        <Text style={styles.h3}>重要な物語設定</Text>
        <TextInput
          style={styles.textArea}
          value={entry.context}
          onChangeText={(text) => setEntry({ ...entry, context: text })}
          placeholder={contextPlaceholder}
          multiline
        />
        <Text style={styles.tips}>
          キャラクターの名前や設定、舞台設定など、ストーリー生成時に記憶させたい情報を入力してください。
          ここに入力された文章は、生成時にプロンプトの先頭に追加されます。
        </Text>
        <Text style={styles.h2}>生成設定</Text>
        <Text style={styles.h3}>AIモデル</Text>
        <Picker
          selectedValue={entry.options.model}
          onValueChange={(newValue) =>
            setEntry({
              ...entry,
              options: { ...entry.options, model: newValue },
            })
          }
        >
          <Picker.Item label="Vecteus-v1" value="vecteus" />
          <Picker.Item label="Ninja-v1" value="ninja" />
        </Picker>
        <Text style={styles.h3}>コンテキストの文字数</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={entry.options.contextLength}
            step={1}
            onValueChange={(newValue) =>
              setEntry({
                ...entry,
                options: { ...entry.options, contextLength: newValue },
              })
            }
            minimumValue={8}
            maximumValue={17}
          />
          <Text>{`${Math.pow(2, entry.options.contextLength)} 文字`}</Text>
        </View>
        <Text style={styles.tips}>
          コンテキストの文字数が多いほど、AIが物語を生成する際に参照する情報が増えます。
          ただし、VRAMの使用量が増加し、生成速度が低下する可能性があります。
          お使いのデバイスのスペックに合わせて調整してください。
        </Text>
        <Text style={styles.h3}>一度に生成する文字数</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            value={entry.options.predictionLength}
            step={1}
            onValueChange={(newValue) =>
              setEntry({
                ...entry,
                options: { ...entry.options, predictionLength: newValue },
              })
            }
            minimumValue={7}
            maximumValue={14}
          />
          <Text>{`${Math.pow(2, entry.options.predictionLength)} 文字`}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  genreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  doneButton: {
    padding: 8,
  },
  optionContainer: {
    paddingHorizontal: 16,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  slider: {
    width: "75%",
  },
  h2: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  required: {
    marginLeft: 4,
    color: "red",
  },
  tips: {
    color: "#999999",
    fontSize: 12,
    marginTop: 6,
  },
  titleInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#737373",
    borderRadius: 4,
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#737373",
    borderRadius: 4,
    height: 160,
    lineHeight: 20,
  },
});
