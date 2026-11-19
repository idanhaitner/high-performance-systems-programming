// The course outline and learning outcomes, from the official syllabus.
// Subjects are written for a reader who starts from zero: every technical word is explained.

export type Part = { id: string; tone: "mint" | "sun" | "coral"; title: string; blurb: string };

export type Subject = {
  number: number;
  part: Part["id"];
  title: string;
  /** A few words for the hero card and the scrolling chip. */
  short: string;
  /** What the subject teaches, in plain words. */
  body: string;
  /** Number of the lecture whose lessons already cover this subject. */
  lecture?: number;
};

export const PARTS: Part[] = [
  {
    id: "c",
    tone: "mint",
    title: "Write real C",
    blurb: "C is a small language that lets you see and control memory directly. This part builds the habit of thinking in bytes.",
  },
  {
    id: "fast",
    tone: "sun",
    title: "Make it fast",
    blurb: "First learn how your data sits in memory and why the cache rewards reading nearby values. Then measure your code and rewrite the slow parts so one processor core does more at once.",
  },
  {
    id: "parallel",
    tone: "coral",
    title: "Use many cores",
    blurb: "One processor chip holds several workers, and a graphics card holds thousands. This part splits a job across them.",
  },
];

// In the order you study them: subject N is lecture N. The subjects without a lecture come last.
export const SUBJECTS: Subject[] = [
  {
    number: 1,
    part: "c",
    title: "Data, memory, and running programs",
    short: "Data and programs",
    body: "How a computer stores numbers and text, what memory and addresses are, and how to print, read, and group values. Then how your C files are compiled and linked into one running program, and how it reads the words typed after its name.",
    lecture: 1,
  },
  {
    number: 2,
    part: "c",
    title: "Memory management",
    short: "Memory management",
    body: "Pointers to pointers, moving a pointer through an array, and what a function call does to memory. Then asking for memory while the program runs with malloc and giving it back with free, and the Linux tools GDB and Valgrind that find memory bugs.",
    lecture: 2,
  },
  {
    number: 3,
    part: "fast",
    title: "Memory layout, alignment, and the cache",
    short: "Layout and cache",
    body: "Where C puts arrays and structures in memory, and why it adds empty bytes between them. A cache is a small, very fast memory close to the processor: code that reads nearby values in order uses it well and runs faster.",
    lecture: 3,
  },
  {
    number: 4,
    part: "fast",
    title: "Code optimization",
    short: "Code optimization",
    body: "Measuring to find the slow part, what the compiler already does for you, how the processor works on several instructions at once, and the rewrites that make one core faster.",
    lecture: 4,
  },
  {
    number: 5,
    part: "parallel",
    title: "Multicore memory and cache coherence",
    short: "Multicore memory",
    body: "What happens when several processor cores share memory, and how they keep their private caches from disagreeing.",
  },
  {
    number: 6,
    part: "parallel",
    title: "Parallel programming with OpenMP",
    short: "OpenMP",
    body: "OpenMP is a way to mark a loop in C so that several cores each take a share of it. You will measure the speedup and see what slows it down.",
  },
  {
    number: 7,
    part: "parallel",
    title: "GPU architecture and an introduction to CUDA",
    short: "GPUs and CUDA",
    body: "A GPU (graphics processing unit) runs thousands of simple threads at once. CUDA is the language extension used to program one.",
  },
  {
    number: 8,
    part: "parallel",
    title: "Efficient CUDA and CPU to GPU performance",
    short: "Fast CUDA",
    body: "Moving data between the processor and the graphics card is slow. You will learn to arrange memory and work so the GPU stays busy.",
  },
];

export const OUTCOMES = [
  "Write C programs that use pointers, arrays, structures, and memory you allocate yourself.",
  "Explain how a program is compiled, linked, loaded, and run, and how its memory is laid out.",
  "Use Linux tools to build, debug, and run C code.",
  "Measure how fast a program is, and find what slows it down.",
  "Explain how caches work, and arrange data so the program uses them well.",
  "Write programs that use several cores with OpenMP, and judge the speedup.",
  "Write basic GPU programs with CUDA.",
  "Compare one core, many cores, and a GPU, and pick the right one for a job.",
];
