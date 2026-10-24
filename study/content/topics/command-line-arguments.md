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

Here `./sum` runs the program, and `3` and `4` are **command-line arguments**: input you hand the program before it starts. This lesson shows how a C program receives those words, and how to turn a word like `"3"` into the number 3. It uses everything from this lecture: pointers, arrays, strings, and the process's memory.

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

The lecture uses `atoi` ("ASCII to integer") from `<stdlib.h>`:

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

:::problem id=worked-omer-sum title="Walk of ./a.out Omer 2 3" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
For `./a.out Omer 2 3`: what is `argc`, what are the four words, and what does the program print? Why can't you just add `argv[2]` and `argv[3]`?

:::solution
- `argc` is 4.
- The words are `"./a.out"`, `"Omer"`, `"2"`, and `"3"`. `argv[4]` is `NULL`.
- `strtol` turns `"2"` into 2 and `"3"` into 3.
- The program prints `Hi Omer`, then `2+3=5`.

`argv[2]` and `argv[3]` are pointers to text, not numbers. C does not allow adding two pointers, so `argv[2] + argv[3]` does not compile.
:::
:::

:::check id=chk-argv0
For `./a.out Omer 2 3`, what does `argv[0]` point to?

- [ ] `Omer`
- [x] `./a.out`
- [ ] `2`

`argv[0]` is always the program name. `Omer` is `argv[1]`.
:::

## Practice

:::problem id=prac-argc-count title="What argc counts" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The command is `./a.out Omer 2 3`.

:::check id=prac-argc-count-q1
`argc` is {{=4|3|5}}.

Four words, counting the program name. The `NULL` at the end is not counted.
:::

:::check id=prac-argc-count-q2
`argv[1]` points to {{=Omer|./a.out|2}}.

Position 0 is the program name. Position 1 is the first word after it.
:::

:::check id=prac-argc-count-q3
`argv[4]` is {{=a null pointer|3|Omer}}.

The last word, `"3"`, is `argv[3]`. `argv[argc]`, here `argv[4]`, is always `NULL`.
:::
:::

:::problem id=prac-atoi-role title="From the string 2 to the integer 2" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-atoi-role-q1
`atoi("2")` returns {{=2|the pointer to the character array|only the code of the character 2}}.

`atoi` reads the digits and returns the number. Its weakness: bad text like `"abc"` also returns 0, just like `"0"`.
:::

:::check id=prac-atoi-role-q2
To use `atoi` and `strtol`, include {{=stdlib.h|stdio.h|string.h}}.

`stdlib.h` ("standard library") has both. `stdio.h` is for `printf` and `scanf`.
:::

:::check id=prac-atoi-role-q3
If `argc` is not 4, the program above {{=returns 1 before printing|prints the greeting and a sum anyway|converts argv[0] as an integer}}.

It checks `argc` first, before printing or converting anything. A bad number also makes it return 1.
:::
:::

:::problem id=prac-argv-shape title="Pointers and argument strings" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use the example memory picture of `./a.out Omer 2 3`.

:::check id=prac-argv-shape-q1
On Linux, the `argv` array and the words are placed {{=at the top of the initial stack|on the heap|in the .text section}}.

The loader puts them there before `main` starts. C itself does not say where they go.
:::

:::check id=prac-argv-shape-q2
The address goes up by 5 from `"Omer"` to `"2"` because

- [x] `"Omer"` has 4 letters plus the ending `'\0'`
- [ ] `argc` is 5
- [ ] Every word takes 5 bytes

Each word takes its length plus one byte for `'\0'`. The earlier jump of 8 is the same for `"./a.out"` (7 + 1).
:::

:::check id=prac-argv-shape-q3
Which statements are true?

- [x] `argv[i]` is a pointer; the letters are stored somewhere else
- [x] The program is allowed to change the argument words
- [ ] `argv[2]` holds the number 2 directly
- [ ] The words must be stored in `.rodata`

`argv[2]` points to the text `"2"`. The number 2 only exists after converting with `strtol` or `atoi`. The words are not read-only.
:::
:::

## Lecture 1 in one paragraph

Numbers live in fixed-size boxes, so they can overflow and round. Each C type picks a box size. Memory is a long row of numbered bytes; pointers hold those numbers, and arrays are boxes side by side. Structures group different values into one record, sometimes with padding. A C file becomes a program through four steps, and a running program (a process) has its own memory with code, globals, a heap, and a stack, where it also finds its command-line arguments. The heap, with `malloc` and `free`, comes in a later lecture.
