// A pocket reference for the coding steps: C functions found by what they do, in plain words.
// It runs in the page with no server, so it only knows the entries below: the library a first C course reaches for.

export type CFunction = {
  name: string;
  header: string;
  signature: string;
  does: string;
  example: string;
  // Words a student might use for this job, beyond the ones in `does`.
  words: string[];
};

export const C_REFERENCE: CFunction[] = [
  // Text (a C string is a row of chars ending in '\0')
  { name: "strlen", header: "<string.h>", signature: "size_t strlen(const char *s)", does: "Counts the characters of a C string, not counting the closing '\\0'.", example: 'strlen("cat") // 3', words: ["length", "size", "count", "characters", "long", "string", "text"] },
  { name: "strcpy", header: "<string.h>", signature: "char *strcpy(char *dest, const char *src)", does: "Copies a C string, with its '\\0', into a row of chars that must already be big enough.", example: "char *copy = malloc(strlen(src) + 1);\nstrcpy(copy, src);", words: ["copy", "duplicate", "clone", "string", "text", "buffer"] },
  { name: "strncpy", header: "<string.h>", signature: "char *strncpy(char *dest, const char *src, size_t n)", does: "Copies at most n characters of a C string. It does not add '\\0' if src is that long.", example: "strncpy(name, src, 15);\nname[15] = '\\0';", words: ["copy", "limit", "bounded", "safe", "first n", "string", "text"] },
  { name: "strcmp", header: "<string.h>", signature: "int strcmp(const char *a, const char *b)", does: "Compares two C strings: 0 if equal, negative if a comes first, positive if b does.", example: 'if (strcmp(a, "quit") == 0) { ... }', words: ["compare", "equal", "same", "order", "sort", "string", "text"] },
  { name: "strcat", header: "<string.h>", signature: "char *strcat(char *dest, const char *src)", does: "Appends a C string to the end of another, in a row of chars big enough for both.", example: 'strcat(path, ".txt");', words: ["append", "join", "concatenate", "add", "glue", "string", "text"] },
  { name: "strchr", header: "<string.h>", signature: "char *strchr(const char *s, int c)", does: "Finds the first place a character appears in a C string, or NULL if it never does.", example: "char *dot = strchr(name, '.');", words: ["find", "search", "character", "position", "contains", "string", "text"] },
  { name: "strstr", header: "<string.h>", signature: "char *strstr(const char *s, const char *part)", does: "Finds where one C string first appears inside another, or NULL if it does not.", example: 'if (strstr(line, "error")) { ... }', words: ["find", "search", "substring", "contains", "inside", "string", "text"] },
  { name: "atoi", header: "<stdlib.h>", signature: "int atoi(const char *s)", does: "Reads a whole number from the start of a C string. It gives 0 when the text is not a number.", example: 'int n = atoi("42"); // 42', words: ["convert", "parse", "number", "int", "text", "string", "read"] },
  { name: "strtol", header: "<stdlib.h>", signature: "long strtol(const char *s, char **end, int base)", does: "Reads a whole number from a C string and tells you where it stopped, so you can spot bad input.", example: "char *end;\nlong n = strtol(text, &end, 10);", words: ["convert", "parse", "number", "int", "text", "string", "read", "check"] },

  // Single characters
  { name: "isdigit", header: "<ctype.h>", signature: "int isdigit(int c)", does: "Nonzero (true) if c is a digit from '0' to '9'.", example: "if (isdigit(c)) { value = value * 10 + (c - '0'); }", words: ["digit", "number", "check", "character", "numeric"] },
  { name: "isalpha", header: "<ctype.h>", signature: "int isalpha(int c)", does: "Nonzero (true) if c is a letter.", example: "if (isalpha(c)) { ... }", words: ["letter", "alphabetic", "check", "character"] },
  { name: "isspace", header: "<ctype.h>", signature: "int isspace(int c)", does: "Nonzero (true) for a space, tab, or newline.", example: "while (isspace(*p)) p++;", words: ["space", "whitespace", "blank", "check", "character", "trim"] },
  { name: "toupper", header: "<ctype.h>", signature: "int toupper(int c)", does: "The capital form of a letter. tolower gives the small form.", example: "c = toupper(c);", words: ["uppercase", "capital", "lowercase", "convert", "case", "character"] },

  // Memory
  { name: "malloc", header: "<stdlib.h>", signature: "void *malloc(size_t bytes)", does: "Asks for a block of memory of that many bytes that stays until you free it. It gives NULL if there is none. The block starts with junk in it.", example: "int *values = malloc(n * sizeof(int));\nif (values == NULL) { return 1; }", words: ["allocate", "heap", "create", "memory", "dynamic", "array", "block", "new"] },
  { name: "calloc", header: "<stdlib.h>", signature: "void *calloc(size_t count, size_t size)", does: "Like malloc for count items of size bytes each, but every byte starts as 0.", example: "int *values = calloc(n, sizeof(int));", words: ["allocate", "heap", "zero", "array", "memory", "dynamic", "clear", "block"] },
  { name: "realloc", header: "<stdlib.h>", signature: "void *realloc(void *old, size_t bytes)", does: "Makes a block of memory bigger or smaller, keeping what it held. It may move the block, so use the pointer it returns.", example: "int *bigger = realloc(values, newSize * sizeof(int));\nif (bigger != NULL) { values = bigger; }", words: ["resize", "grow", "shrink", "allocate", "array", "memory", "dynamic", "extend", "bigger"] },
  { name: "free", header: "<stdlib.h>", signature: "void free(void *p)", does: "Gives a block from malloc, calloc, or realloc back. Free each block once, and do not use it afterwards.", example: "free(values);\nvalues = NULL;", words: ["release", "deallocate", "heap", "memory", "delete", "leak", "destroy"] },
  { name: "memcpy", header: "<string.h>", signature: "void *memcpy(void *dest, const void *src, size_t bytes)", does: "Copies raw bytes from one place to another. The two places must not overlap. The count is in bytes.", example: "memcpy(dest, src, n * sizeof(int));", words: ["copy", "bytes", "array", "memory", "raw", "duplicate"] },
  { name: "memmove", header: "<string.h>", signature: "void *memmove(void *dest, const void *src, size_t bytes)", does: "Copies raw bytes like memcpy, but is safe when the two places overlap, for example when shifting items along.", example: "memmove(&a[1], &a[0], (n - 1) * sizeof(int));", words: ["copy", "shift", "overlap", "bytes", "array", "memory", "move"] },
  { name: "memset", header: "<string.h>", signature: "void *memset(void *dest, int byte, size_t bytes)", does: "Sets every byte of a block of memory to one value, usually 0.", example: "memset(values, 0, n * sizeof(int));", words: ["fill", "zero", "clear", "bytes", "array", "memory", "reset", "initialize"] },
  { name: "memcmp", header: "<string.h>", signature: "int memcmp(const void *a, const void *b, size_t bytes)", does: "Compares raw bytes of two places: 0 if they are all equal.", example: "if (memcmp(&p, &q, sizeof(p)) == 0) { ... }", words: ["compare", "equal", "same", "bytes", "memory", "raw"] },
  { name: "memchr", header: "<string.h>", signature: "void *memchr(const void *p, int byte, size_t bytes)", does: "Finds the first place a byte value appears in a block of memory, or NULL if it does not.", example: "char *hit = memchr(data, 'x', size);", words: ["find", "search", "byte", "position", "memory", "contains"] },
  { name: "sizeof", header: "built in", signature: "sizeof(type)  sizeof expr", does: "The size in bytes of a type or a variable, worked out by the compiler. For an array it is the whole array, not one item.", example: "sizeof(int) // 4 on most machines", words: ["size", "bytes", "memory", "type", "how big"] },

  // Printing and reading
  { name: "printf", header: "<stdio.h>", signature: "int printf(const char *format, ...)", does: "Prints text, filling each % in the format with the next value. %d is an int, %f a double, %c a char, %s a string.", example: 'printf("total: %d\\n", total);', words: ["print", "output", "write", "display", "show", "stdout", "console", "format", "number"] },
  { name: "puts", header: "<stdio.h>", signature: "int puts(const char *s)", does: "Prints a C string and then a new line.", example: 'puts("hello");', words: ["print", "output", "write", "display", "show", "line", "string", "text"] },
  { name: "putchar", header: "<stdio.h>", signature: "int putchar(int c)", does: "Prints one character.", example: "putchar('!');", words: ["print", "output", "write", "character", "show"] },
  { name: "scanf", header: "<stdio.h>", signature: "int scanf(const char *format, ...)", does: "Reads values typed in, by the same % codes as printf. Pass the address of each variable with &. It returns how many values it read.", example: 'int n;\nif (scanf("%d", &n) == 1) { ... }', words: ["read", "input", "stdin", "scan", "keyboard", "number", "get"] },
  { name: "fgets", header: "<stdio.h>", signature: "char *fgets(char *buf, int size, FILE *in)", does: "Reads one line of input, spaces and all, into a row of chars of that size. It keeps the new line.", example: "char line[100];\nfgets(line, sizeof(line), stdin);", words: ["read", "input", "line", "stdin", "text", "string", "get"] },
  { name: "getchar", header: "<stdio.h>", signature: "int getchar(void)", does: "Reads one character of input. It gives EOF when the input has ended.", example: "int c;\nwhile ((c = getchar()) != EOF) { ... }", words: ["read", "input", "character", "stdin", "get"] },
  { name: "sprintf / snprintf", header: "<stdio.h>", signature: "int snprintf(char *buf, size_t size, const char *format, ...)", does: "Works like printf, but writes into a row of chars instead of the screen. snprintf stops at the size you give, so prefer it.", example: 'char label[32];\nsnprintf(label, sizeof(label), "#%d", id);', words: ["format", "convert", "number", "text", "string", "build", "print"] },

  // Sorting and searching
  { name: "qsort", header: "<stdlib.h>", signature: "void qsort(void *base, size_t count, size_t size, int (*cmp)(const void *, const void *))", does: "Sorts an array. You give it a small function that compares two items.", example: "int by_value(const void *a, const void *b) {\n    return *(const int *)a - *(const int *)b;\n}\nqsort(v, n, sizeof(int), by_value);", words: ["sort", "order", "ascending", "arrange", "array", "compare"] },
  { name: "bsearch", header: "<stdlib.h>", signature: "void *bsearch(const void *key, const void *base, size_t count, size_t size, int (*cmp)(const void *, const void *))", does: "Finds an item in a sorted array, quickly. It gives a pointer to it, or NULL.", example: "int *hit = bsearch(&key, v, n, sizeof(int), by_value);", words: ["find", "search", "sorted", "array", "binary", "contains"] },

  // Numbers
  { name: "abs", header: "<stdlib.h>", signature: "int abs(int n)", does: "The absolute value of a whole number: how far it is from zero.", example: "abs(-4) // 4", words: ["absolute", "positive", "distance", "number"] },
  { name: "sqrt / pow", header: "<math.h>", signature: "double sqrt(double x)  double pow(double base, double exp)", does: "Square root, and one number raised to a power. Link with -lm on some machines.", example: "double area = 3.14159 * pow(r, 2);", words: ["square root", "power", "exponent", "math", "number"] },
  { name: "rand / srand", header: "<stdlib.h>", signature: "int rand(void)  void srand(unsigned seed)", does: "rand gives a random-looking whole number. Call srand once first with a seed, such as the time, for a different run each time.", example: "srand(time(NULL));\nint roll = rand() % 6 + 1;", words: ["random", "dice", "number", "chance"] },

  // Stopping and checking
  { name: "assert", header: "<assert.h>", signature: "void assert(condition)", does: "Stops the program with a message if the condition is false. Good for checking what you believe is true.", example: "assert(index < size);", words: ["check", "stop", "debug", "condition", "test", "error"] },
  { name: "exit", header: "<stdlib.h>", signature: "void exit(int status)", does: "Ends the whole program at once. 0 means it went well, anything else means a problem.", example: "if (file == NULL) { exit(1); }", words: ["stop", "quit", "end", "terminate", "error"] },
];

// Words that say nothing about the job.
const FILLER = new Set(["a", "an", "the", "of", "to", "in", "on", "for", "and", "or", "i", "how", "do", "can", "my", "is", "it", "with", "from", "into", "want", "need", "what", "c", "function", "use", "get", "make", "two", "one"]);

// Plain words people use, folded onto the ones the entries are tagged with.
const SAME: Record<string, string> = {
  len: "length", long: "length", chars: "characters", char: "characters", letters: "characters",
  strings: "string", str: "string", word: "string", text: "string",
  duplicate: "copy", clone: "copy", copies: "copy", copying: "copy",
  concat: "concatenate", join: "concatenate", combine: "concatenate",
  equals: "equal", equality: "equal", same: "equal",
  free: "release", dealloc: "release", deallocate: "release",
  new: "allocate", alloc: "allocate", allocating: "allocate",
  arrays: "array", list: "array", lists: "array",
  sum: "total", biggest: "maximum", largest: "maximum", max: "maximum", smallest: "minimum", min: "minimum",
  search: "find", locate: "find", contains: "find",
  printing: "print", display: "print", output: "print",
  input: "read", scan: "read",
};

const normalize = (word: string) => SAME[word] ?? word;

// What a value is, rather than what to do with it: these alone should not pull up every string or array entry.
const SUBJECTS = new Set(["string", "array", "characters", "number", "memory"]);

function wordsOf(text: string) {
  return text.toLowerCase().split(/[^a-z0-9_]+/).filter((word) => word && !FILLER.has(word)).map(normalize);
}

// Ranks entries by how many of the query's words they cover, weighting the name and tagged words over the description.
export function findFunctions(query: string, limit = 6): CFunction[] {
  const wanted = wordsOf(query);
  if (wanted.length === 0) return [];
  const scored = C_REFERENCE.map((entry, order) => {
    const names = entry.name.toLowerCase().split(/[^a-z0-9_]+/).filter(Boolean);
    const tags = entry.words.flatMap((tag) => wordsOf(tag));
    const said = wordsOf(entry.does);
    let score = 0;
    let covered = 0;
    for (const word of wanted) {
      const named = names.includes(word) ? 4 : word.length > 3 && names.some((part) => part.includes(word)) ? 3 : 0;
      const tagged = tags.some((tag) => tag === word) ? 3 : tags.some((tag) => tag.length > 3 && word.length > 3 && (tag.startsWith(word) || word.startsWith(tag))) ? 1.5 : 0;
      // The name and the tags often say the same word, so the stronger of the two counts, not both.
      const strength = Math.max(named, tagged) + (said.includes(word) ? 1 : 0);
      const hit = SUBJECTS.has(word) ? Math.min(strength, 1.5) : strength;
      if (hit > 0) covered += 1;
      score += hit;
    }
    // An entry that covers every word beats one that matches a single word strongly.
    return { entry, score: score + covered * 2 + (covered === wanted.length ? 3 : 0), order };
  });
  return scored.filter((item) => item.score > 2).sort((a, b) => b.score - a.score || a.order - b.order).slice(0, limit).map((item) => item.entry);
}

export const SUGGESTIONS = ["copy a string", "length of a string", "compare two strings", "allocate an array", "make an array bigger", "print a number"];
