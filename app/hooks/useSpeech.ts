import Constants from "expo-constants";
import * as Speech from "expo-speech";

export const useSpeech = () => {
  const speak = (text: string) => {
    Speech.speak(text, {
      rate: 1.0,
      language: "ja",
      pitch: 1.0,
    });
  };

  const stop = Speech.stop;
  const pause = Speech.pause;
  const resume = Speech.resume;

  return { speak, stop, pause, resume };
};
