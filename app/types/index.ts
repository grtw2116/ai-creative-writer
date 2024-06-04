export type Entry = {
  title: string;
  summary: string;
  text: string;
  context: string;
  options: Options;
};

type Options = {
  model: string;
  contextLength: number;
  generatingLength: number;
};

export type KeyedEntry = {
  key: string;
  entry: Entry;
};
