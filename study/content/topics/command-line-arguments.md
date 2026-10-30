---
id: command-line-arguments
title: Command-line arguments
sources:
  - "Lecture 1 - Introduction.pdf"
---

When you run a program from the terminal, you can type extra words after its name:

```text
./sum 3 4
```

Here `./sum` runs the program, and `3` and `4` are **command-line arguments**: input you hand the program before it starts. This lesson shows how a C program receives those words, and how to turn a word like `"3"` into the number 3. It uses everything so far: pointers, arrays, strings, and the process's memory.

## Receiving the arguments: argc and argv

So far `main` has been written as `int main(void)`, where `void` means "takes nothing". To receive the arguments, write it like this instead:

```c
int main(int argc, char *argv[]) {
    return 0;
}
```

Now `main` gets two things:

- **`argc`** ("argument count"): how many words were typed, **including the program's own name**.
- **`argv`** ("argument vector", meaning list): an array of strings, one per word.

:::definition id=def-argv title="argc and argv" source="Lecture 1 - Introduction.pdf"
`argc` is the number of words on the command line, counting the program name. `argv` is an array of pointers, one per word, each pointing to that word as a string. After the last word, `argv[argc]` is `NULL`.
:::

Why `char *argv[]`? Each word is a string, and a string is an array of `char`, which we pass around as a `char *` (a pointer to its first letter). So `argv` is an array of `char *`: a list of pointers, each pointing to one word.

### An example

For this command:

```text
./a.out Omer 2 3
```

| Slot | Contents |
| --- | --- |
| `argc` | 4 |
| `argv[0]` | points to `"./a.out"` (the program name) |
| `argv[1]` | points to `"Omer"` |
| `argv[2]` | points to `"2"` |
| `argv[3]` | points to `"3"` |
| `argv[4]` | `NULL` (marks the end) |

Notice that `argc` is 4, not 3, because the program name counts. The real arguments start at `argv[1]`. The valid positions are `argv[0]` to `argv[argc - 1]`. To go through all the arguments, loop until you reach `argc`, or until you hit the `NULL`.

### Where the words are in memory

Before `main` starts, the loader (from the previous lesson) puts the `argv` array and the words themselves at the top of the process's stack. Each word is stored with its ending `'\0'`, so each takes its length plus one byte:

- `"./a.out"` is 7 characters + `'\0'` = 8 bytes
- `"Omer"` is 4 + 1 = 5 bytes
- `"2"` is 1 + 1 = 2 bytes

That is why, in the picture below, the words start at addresses 100, 108, 113, and 115 (example addresses): each starts right after the previous one ends.

![An example argument vector. The strings are modifiable, and the addresses are illustrative.](../assets/figures/argv-layout.svg)

Unlike fixed text such as `"hello"` in your code, your program is allowed to change these words. (Their exact place in memory is a Linux convention, not a C rule.)

:::trap
Thinking `argc` counts only the words after the program name. For `./a.out Omer 2 3`, `argc` is 4, because `argv[0]` is the program name. A program expecting a name and two numbers should check `argc == 4`.
:::

## Turning text into numbers

Here is the important catch: **every argument arrives as text**, even if it looks like a number. `argv[2]` is not the number 2; it is a pointer to the characters `'2'` and `'\0'`. You cannot do math with it directly. `argv[2] + argv[3]` does not even compile, because C does not let you add two pointers.

So you must **convert** the text into a number first. Our goal:

```text
./a.out Omer 2 3
Hi Omer
2+3=5
```

### The simple way: atoi

The simplest tool is `atoi` ("ASCII to integer") from `<stdlib.h>`:

```c
int x = atoi(argv[2]);   /* "2" becomes 2 */
```

It is easy, but it has a weakness: it cannot tell you when the input is bad. `atoi("abc")` returns 0, exactly like `atoi("0")`. You cannot tell the two apart.

### The safe way: strtol

`strtol` ("string to long"), also in `<stdlib.h>`, does the same conversion but also tells you **where it stopped reading**. If it stopped before the end of the text, the text was not a clean number.

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    char *end;   /* strtol will set this to where it stopped */
    long x;
    long y;

    if (argc != 4) {          /* we need: name, word, number, number */
        return 1;
    }
    x = strtol(argv[2], &end, 10);          /* 10 means "decimal" */
    if (end == argv[2] || *end != '\0') {   /* not a clean number? */
        return 1;
    }
    y = strtol(argv[3], &end, 10);
    if (end == argv[3] || *end != '\0') {
        return 1;
    }
    printf("Hi %s\n", argv[1]);
    printf("%ld+%ld=%ld\n", x, y, x + y);   /* %ld prints a long */
    return 0;
}
```

How the two checks work, after `x = strtol(argv[2], &end, 10);`:

- **`end == argv[2]`**: `strtol` did not move at all, so there were no digits. This catches `""` and `"abc"`.
- **`*end != '\0'`**: `strtol` stopped before the end of the string, so there was junk after the digits. This catches `"2x"`.

If both checks pass, the whole word was a number. For `./a.out Omer 2 3` the program prints `Hi Omer` and then `2+3=5`.

(A fully careful program would also catch numbers too big to fit in a `long`, using a variable called `errno`. You do not need that yet.)

:::check id=chk-argv0
You start a program by typing `./calc 7 8`. Which expression gives the number 15?

- [x] `atoi(argv[1]) + atoi(argv[2])`
- [ ] `argv[1] + argv[2]`
- [ ] `atoi(argv[0]) + atoi(argv[1])`

`argv[0]` is `./calc`, so the numbers are in `argv[1]` and `argv[2]`. Each is text, so it must be turned into a number first. Adding the two `char *` values directly does not even compile.
:::

## Practice

:::problem id=prac-argc-count title="What argc counts" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new command: `./avg 10 20 30 40`.

:::check id=prac-argc-count-q1
`for (int i = 1; i < argc; i++)` runs its body {{=4|5|3}} times.

`argc` is 5, so `i` goes 1, 2, 3, 4. The loop starts at 1 to skip the program's name.
:::

:::check id=prac-argc-count-q2
`argv[argc - 1]` points to {{="40"|"30"|NULL}}.

`argc - 1` is 4, and `argv[4]` is the last word. `argv[argc]` is the `NULL` that marks the end.
:::

:::check id=prac-argc-count-q3
`argv[2][1]` is {{=the character '0'|the character '2'|the number 20}}.

`argv[2]` is the text `"20"`. Index 1 of that text is its second character, `'0'`.
:::
:::

:::problem id=prac-atoi-role title="From the string 2 to the integer 2" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-atoi-role-q1
`atoi("abc12")` returns {{=0|12|an error code}}.

`atoi` stops at the first thing that is not part of a number. Here that is the very first letter, so it has read nothing and returns 0. It cannot report an error.
:::

:::check id=prac-atoi-role-q2
`atoi("-7.9")` returns {{=-7|-8|0}}.

`atoi` reads an optional sign and then digits, and stops at the `.`. It does not round, because it never looks at the 9.
:::

:::check id=prac-atoi-role-q3
After `char *end; long v = strtol("42x", &end, 10);`, the value of `*end` is {{='x'|'\0'|'4'}}.

`strtol` sets `end` to the first character it did not use. A clean number would leave `end` on the `'\0'`, which is why the check is `*end != '\0'`.
:::
:::

:::problem id=prac-argv-shape title="Pointers and argument strings" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new command: `./p hello 42`. As in the lesson's picture, the words are stored one right after another; say `"./p"` starts at address 200.

:::check id=prac-argv-shape-q1
`"42"` starts at address {{=210|209|206}}.

`"./p"` takes 4 bytes with its `'\0'`, so `"hello"` starts at 204. `"hello"` takes 6 bytes, so the next word starts at 210.
:::

:::check id=prac-argv-shape-q2
`argv[2] - argv[1]` is {{=6|1|5}}.

These are `char *` values, so the difference counts bytes between the two words: $210 - 204 = 6$. That is the 5 letters of `hello` and its `'\0'`.
:::

:::check id=prac-argv-shape-q3
Which statements are true?

- [x] `argv[2]` is a pointer to the text `"42"`; the number 42 exists only after `strtol` or `atoi`
- [x] The program is allowed to change the argument words
- [ ] `argv[2]` holds the number 42 directly
- [ ] The words must be stored in `.rodata`

Every argument arrives as text. The words sit at the top of the stack on Linux and are not read-only.
:::
:::

## Lecture 1 in one paragraph

Numbers live in fixed-size boxes, so they can overflow and round. Each C type picks a box size. Memory is a long row of numbered bytes; pointers hold those numbers, and arrays are boxes side by side. `printf` and `scanf` print and read values through format specifiers, and `scanf` leaves unread characters, like the Enter key, waiting in the input buffer. A string is a `char` array ending in `'\0'`, and `string.h` measures, copies, compares, and splits strings. Structures group different values into one record, sometimes with padding. A C file, or several files sharing a header, becomes a program through four steps, and a running program (a process) has its own memory with code, globals, a heap, and a stack, where it also finds its command-line arguments. The heap, with `malloc` and `free`, is the main topic of Lecture 2, which starts with [Pointers to pointers](topic:pointers-to-pointers).
