import * as Speech from "expo-speech";
import { Platform } from "react-native";

export const useSpeech = () => {
  const available = Speech.getAvailableVoicesAsync();
  available.then((result) => {
    console.log(result.filter((voice) => voice.language === "ja-JP"));
  });

  const speak = (text: string, onDone?: () => void) => {
    Speech.speak(text, {
      onDone: onDone,
      rate: 1.0,
      voice:
        Platform.OS === "ios"
          ? "com.apple.voice.compact.ja-JP.Kyoko"
          : "ja-JP-language",
      pitch: 1.0,
    });
  };

  const isSpeaking = Speech.isSpeakingAsync;

  const stop = Speech.stop;
  const pause = Speech.pause;
  const resume = Speech.resume;

  return { speak, stop, pause, resume, isSpeaking };
};
