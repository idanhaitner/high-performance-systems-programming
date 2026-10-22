export type Block =
  | { type: "paragraph"; text: string; line?: number }
  | { type: "heading"; level: number; text: string; line?: number }
  | { type: "quote"; text: string; line?: number }
  | { type: "code"; lang: string; text: string; line?: number }
  | { type: "math"; text: string; line?: number }
  | { type: "table"; header: string[]; rows: string[][]; line?: number }
  | {
      type: "list";
      ordered: boolean;
      items: { text: string; children: Block[]; line?: number }[];
      line?: number;
    }
  | {
      type: "directive";
      name: string;
      attrs: Record<string, string>;
      children: Block[];
      line?: number;
    };

export type LessonRef = {
  id: string;
  title: string;
  blurb: string;
  lessonNumber: number;
  practiceIds: string[];
};

export type Lecture = {
  id: string;
  number: number;
  title: string;
  summary: string;
  lessons: LessonRef[];
};

export type Topic = {
  id: string;
  title: string;
  blurb: string;
  practiceIds: string[];
  blocks: Block[];
  lectureId: string;
  lectureNumber: number;
  lectureTitle: string;
  lessonNumber: number;
};

export type GlossaryEntry = {
  term: string;
  topic: string;
  topicTitle: string;
  definition: string;
  anchor: string;
};

export type SearchHit = {
  kind: string;
  title: string;
  text: string;
  href: string;
};

export type Course = {
  id: string;
  title: string;
  lang: string;
  dir: "ltr" | "rtl";
  summary: string;
  lectures: Lecture[];
  topics: Topic[];
  glossary: GlossaryEntry[];
  search: SearchHit[];
};
