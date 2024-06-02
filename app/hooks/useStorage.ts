import { Entry, KeyedEntry } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useStorage() {
  /**
   * AsyncStorageからエントリを非同期で読み込みます。
   *
   * @param {string} uniqueKey - データが保存されている一意のキー。
   * @returns {Promise<Entry>} 読み込まれたエントリを解決するプロミス。
   * @throws {Error} プロバイダされたキーの下にデータが見つからない場合はエラーがスローされます。
   */
  async function loadEntry(uniqueKey: string) {
    const value = await AsyncStorage.getItem(uniqueKey);
    if (!value) {
      throw new Error("データが見つかりませんでした。");
    }
    return JSON.parse(value) as Entry;
  }

  /**
   * AsyncStorageからすべてのエントリを非同期で読み込みます。
   *
   * @returns {Promise<KeyedEntry[]>} 読み込まれたエントリの配列を解決するプロミス。
   * @throws {Error} データが見つからない場合はエラーがスローされます。
   */
  async function loadAllEntries() {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    return entries.map(([key, value]) => {
      if (!value) throw new Error("データが見つかりませんでした。");
      return {
        key: key,
        entry: JSON.parse(value) as Entry,
      } as KeyedEntry;
    });
  }

  /**
   * エントリを非同期でAsyncStorageに保存します。
   *
   * @param {string} key - データを保存する一意のキー。
   * @param {Entry} entry - 保存するエントリ。
   */
  async function saveEntry(key: string, entry: Entry) {
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  }

  return { loadEntry, loadAllEntries, saveEntry };
}
