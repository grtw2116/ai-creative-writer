export type Entry = {
  title: string;
  summary: string;
  text: string;
  context: string;
};

export type KeyedEntry = {
  key: string;
  entry: Entry;
};
