export type Entry = {
  title: string;
  text: string;
  context: string;
};

export type EntryWithUniqueKey = {
  uniqueKey: string;
  entry: Entry;
};
