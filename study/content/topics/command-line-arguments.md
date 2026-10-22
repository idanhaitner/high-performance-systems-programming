---
id: command-line-arguments
title: Command-line arguments
sources:
  - "Lecture 1 - Introduction.pdf"
---

`int main()` with an empty parameter list ignores the words typed after the program name. The two-parameter signature receives those words. They arrive as strings. A number typed on the command line is still a string until the program converts it.

## argc and argv

:::definition id=def-argv title="argc and argv" source="Lecture 1 - Introduction.pdf"
`argc` is the number of words passed to the program on the command line, including the program name. `argv` is an array of pointers to those words. The array is terminated by a null pointer, one past the last word.
:::

```c
int main(int argc, char *argv[]) {
    return 0;
}
```

`argv` is an array of pointers to `char`. For the run

```text
./a.out Omer 2 3
```

one concrete layout is:

| Slot | Contents |
| --- | --- |
| argc | 4 |
| argv[0] | pointer to `"./a.out"` |
| argv[1] | pointer to `"Omer"` |
| argv[2] | pointer to `"2"` |
| argv[3] | pointer to `"3"` |
| argv[4] | `NULL` |

`argc` counts the four words. It does not count the `NULL`. The vector still has that extra slot, which is how a loop can walk `argv` until it sees a null pointer.

`argc` and the pointer vector sit on the stack, with `argv` at address 1000. The character arrays sit in `.rodata` at the addresses the pointers hold: 100, 108, 113, and 115. Those numbers are an example. The relationship is the fact to learn. `"./a.out"` occupies 8 bytes including its `'\0'` (`100 + 8 = 108`). `"Omer"` occupies 5 (`108 + 5 = 113`). `"2"` occupies 2 (`113 + 2 = 115`). `"3"` starts at 115.

![argc and the argv pointer vector on the stack, and the four argument strings at example addresses.](../assets/figures/argv-layout.svg)

:::theorem id=thm-argv-null title="The vector is one longer than argc" source="Lecture 1 - Introduction.pdf"
For `./a.out Omer 2 3`, `argc` is 4, the words are `argv[0]` through `argv[3]`, and `argv[4]` is `NULL`.

:::proof
**Intuition.** `argc` counts words the user and the shell supplied. The implementation adds a null pointer so the end of the vector is visible in the vector itself.

**Proof.** The command has the program name and three further words, which is four. `argc` is 4 and `argv[0]` through `argv[3]` are pointers to those four strings. The next slot, `argv[4]`, is `NULL`. So the legal word indices are `0` through `argc - 1`, and `argv[argc]` is the null pointer.

**What the proof used.** The command `./a.out Omer 2 3`, and the null pointer at `argv[4]` while `argc` is 4.
:::
:::

:::trap
Taking `argc` to be the number of words after the program name. For `./a.out Omer 2 3` the value is 4, because `argv[0]` is `"./a.out"`. A check for three user words is `argc != 4`, which is what the adder below uses.
:::

## A program that reads its arguments

This run prints a greeting and a sum:

```text
./a.out Omer 2 3
Hi Omer
2+3=5
```

:::algorithm id=alg-argv-sum title="Sum two command-line integers" source="Lecture 1 - Introduction.pdf" complexity="A fixed check of argc and two conversions" invariant="When argc is 4, argv[1] is the name to greet and argv[2] and argv[3] are the decimal strings to add."
```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc != 4)
        return 1;
    printf("Hi %s\n", argv[1]);
    int x = atoi(argv[2]); /* "2" -> 2 */
    int y = atoi(argv[3]); /* "3" -> 3 */
    printf("%d+%d=%d\n", x, y, x + y);
    return 0;
}
```
:::

`%s` prints a string, the same conversion used for a struct's `name`. `atoi` (ASCII to integer), declared through `<stdlib.h>`, converts a string to an `int`. The string must represent a valid integer. `"2"` and `"3"` do. The sum printed is `2+3=5`. If `argc` is anything else, the program returns 1 and prints nothing.

`argv[2]` is a pointer to characters. It is not an `int`. Passing it to `printf` with `%d`, or adding it with `+` as if it were a number, uses the pointer rather than the integer the characters spell. `atoi` is the conversion between the string and the arithmetic.

:::problem id=worked-omer-sum title="Walk of ./a.out Omer 2 3" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Give `argc`, the four strings, and the two lines the program prints. Say what `atoi` does to `argv[2]` and `argv[3]`.

:::solution
`argc` is 4. The strings are `"./a.out"`, `"Omer"`, `"2"`, and `"3"`, and `argv[4]` is `NULL`. `atoi(argv[2])` is 2 and `atoi(argv[3])` is 3. The program prints `Hi Omer` and then `2+3=5`.
:::
:::

:::check id=chk-argv0
For `./a.out Omer 2 3`, what is `argv[0]`?

- [ ] `Omer`
- [x] `./a.out`
- [ ] `2`

The first word is the program name as it was invoked. `Omer` is `argv[1]`.
:::

## Practice

:::problem id=prac-argc-count title="What argc counts" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The invocation is `./a.out Omer 2 3`.

:::check id=prac-argc-count-q1
`argc` is {{=4|3|5}}.

Four words are passed. The terminating `NULL` is not included in the count.
:::

:::check id=prac-argc-count-q2
`argv[1]` points at {{=Omer|./a.out|2}}.

Index 0 is the program, index 1 is the next word.
:::

:::check id=prac-argc-count-q3
`argv[4]` is {{=NULL|3|Omer}}.

A null pointer sits one past the last word. The last word, `"3"`, is `argv[3]`.
:::
:::

:::problem id=prac-atoi-role title="From the string 2 to the int 2" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-atoi-role-q1
`atoi(argv[2])` when `argv[2]` is `"2"` yields {{=2|the pointer argv[2]|ascii code of the character 2 only}}.

`atoi` converts the whole decimal string to an `int`. `"2"` becomes 2.
:::

:::check id=prac-atoi-role-q2
The header for `atoi` is {{=stdlib.h|stdio.h|string.h}}.

`printf` needs `stdio.h`. `atoi` needs `stdlib.h`. The program includes both.
:::

:::check id=prac-atoi-role-q3
If `argc` is not 4, the program {{=returns 1|prints Hi and a sum anyway|calls atoi on argv[0]}}.

The guard is `if (argc != 4) return 1;`, before any print.
:::
:::

:::problem id=prac-argv-shape title="Where the pointers and the characters sit" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use this layout of `./a.out Omer 2 3`.

:::check id=prac-argv-shape-q1
`argc` and the `argv` slots sit on the {{=stack|heap|.text}}.

Command-line arguments are stored with the stack. The character arrays live separately.
:::

:::check id=prac-argv-shape-q2
The address gap from `"Omer"` at 108 to `"2"` at 113 is 5 because

- [x] `"Omer"` is four letters plus a terminating NUL
- [ ] `argc` is 5
- [ ] Every argument occupies 5 bytes regardless of length

`"./a.out"` accounts for the earlier gap of 8, from 100 to 108, the same way: characters plus `'\0'`.
:::

:::check id=prac-argv-shape-q3
Which statements are true?

- [x] `argv[i]` is a pointer, and the characters live in a separate array
- [x] The numeric addresses 100 and 1000 are an example, not universal addresses
- [ ] `argv[2]` holds the `int` 2 directly, with no character array
- [ ] `argc` includes the `NULL` slot

The value used in arithmetic is what `atoi` returns. The cell `argv[2]` holds a pointer. `argc` is 4 for four words.
:::
:::

The map so far is why low-level programming matters, C and memory, data representation, the path from source to an executable, the path from an executable to a process, and the C basics of types, `sizeof`, input and output, and structures. Efficient code depends on what happens beneath the code.

Dynamic memory comes next: `malloc`, `calloc`, `realloc`, and `free`, and the questions of ownership, lifetime, leaks, and use after release. The address space those calls use is already fixed, including the heap in [From source to a running process](topic:source-to-process).
