// The course outline and learning outcomes, from the official syllabus.
// Subjects are written for a reader who starts from zero: every technical word is explained.

export type Part = { id: string; tone: "mint" | "sun" | "coral"; title: string; blurb: string };

export type Subject = {
  number: number;
  part: Part["id"];
  title: string;
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
    blurb: "First learn to measure how long code takes. Then learn why the same work can run much faster when it touches memory in a friendlier order.",
  },
  {
    id: "parallel",
    tone: "coral",
    title: "Use many cores",
    blurb: "One processor chip holds several workers, and a graphics card holds thousands. This part splits a job across them.",
  },
];

export const SUBJECTS: Subject[] = [
  {
    number: 1,
    part: "c",
    title: "Introduction to C and systems programming",
    body: "How a computer stores numbers and text, how your C code turns into a running program, and why a low level language is worth learning.",
    lecture: 1,
  },
  {
    number: 2,
    part: "c",
    title: "Pointers, arrays, and dynamic memory",
    body: "A pointer is the address of a value. You will follow pointers through arrays, and ask for memory while the program runs with malloc and give it back with free.",
    lecture: 2,
  },
  {
    number: 3,
    part: "c",
    title: "Writing real C software",
    body: "Splitting a program across several files, compiling and linking them, and keeping the pieces small enough to understand.",
  },
  {
    number: 4,
    part: "c",
    title: "C and the Linux operating system",
    body: "Working in the Linux command line, calling the operating system from C, and using tools that find bugs and show what a program is doing.",
  },
  {
    number: 5,
    part: "fast",
    title: "Measuring and understanding performance",
    body: "Timing a program honestly, using a profiler (a tool that shows where the time goes), and finding the few places that make a program slow.",
  },
  {
    number: 6,
    part: "fast",
    title: "Cache, locality, and efficient C",
    body: "A cache is a small, very fast memory close to the processor. Code that reads nearby values in order uses it well and runs faster.",
  },
  {
    number: 7,
    part: "parallel",
    title: "Multicore memory and cache coherence",
    body: "What happens when several processor cores share memory, and how they keep their private caches from disagreeing.",
  },
  {
    number: 8,
    part: "parallel",
    title: "Parallel programming with OpenMP",
    body: "OpenMP is a way to mark a loop in C so that several cores each take a share of it. You will measure the speedup and see what slows it down.",
  },
  {
    number: 9,
    part: "parallel",
    title: "GPU architecture and an introduction to CUDA",
    body: "A GPU (graphics processing unit) runs thousands of simple threads at once. CUDA is the language extension used to program one.",
  },
  {
    number: 10,
    part: "parallel",
    title: "Efficient CUDA and CPU to GPU performance",
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
