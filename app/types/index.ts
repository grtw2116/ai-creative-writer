export type Entry = {
  title: string;
  genres: Genre[];
  summary: string;
  text: string;
  context: string;
  options: Options;
};

type Options = {
  model: string;
  contextLength: number;
  predictionLength: number;
};

export type KeyedEntry = {
  key: string;
  entry: Entry;
};

export type Genre = {
  key: GenreKey;
  label: string;
  selected: boolean;
};

export type GenreKey =
  | "fantasy"
  | "scifi"
  | "mystery"
  | "romance"
  | "thriller"
  | "horror"
  | "historical"
  | "adventure"
  | "young adult"
  | "comedy";
