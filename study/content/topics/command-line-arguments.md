---
id: command-line-arguments
title: Command-line arguments
sources:
  - "Lecture 1 - Introduction.pdf"
---

A program declared with `int main(void)` ignores its command line. To read the arguments, declare `int main(int argc, char *argv[])`. Every argument arrives as a string, even one that looks like a number: `2` arrives as the characters `'2'` and `'\0'`, and the program must convert it before doing arithmetic.

## The argument vector

:::definition id=def-argv title="argc and argv" source="Lecture 1 - Introduction.pdf"
`argc` (argument count) is the number of command-line strings, including the program name. `argv` (argument vector) is an array of pointers to those strings. After the last one, `argv[argc]` is a null pointer.
:::

```c
int main(int argc, char *argv[]) {
    return 0;
}
```

The program may modify these strings; unlike string literals, they are not in `.rodata`. On Linux, the loader places both the `argv` array and the strings at the top of the initial stack, before `main` runs. That placement is an operating-system convention, not a C rule.

For this command:

```text
./a.out Omer 2 3
```

| Slot | Contents |
| --- | --- |
| `argc` | 4 |
| `argv[0]` | pointer to `"./a.out"` |
| `argv[1]` | pointer to `"Omer"` |
| `argv[2]` | pointer to `"2"` |
| `argv[3]` | pointer to `"3"` |
| `argv[4]` | null pointer |

`argc` counts the four strings but not the null pointer after them. The valid indexes are therefore 0 through `argc - 1`. A loop over the arguments can stop either at `argc` or at the null pointer.

In the figure, the pointer array starts at address 1000 and the strings start at 100, 108, 113, and 115 (example addresses). Each gap is the length of the previous string plus its `'\0'`: `"./a.out"` takes 8 bytes, `"Omer"` 5, and `"2"` 2.

![An example argument vector. The strings are modifiable, and the addresses are illustrative.](../assets/figures/argv-layout.svg)

:::trap
Treating `argc` as the number of words after the program name. For `./a.out Omer 2 3`, `argc` is 4, because `argv[0]` is the program name. A program that expects a name and two numbers checks `argc == 4`.
:::

## Conversion

This invocation should print a name and a sum:

```text
./a.out Omer 2 3
Hi Omer
2+3=5
```

The lecture converts the numbers with `atoi` from `<stdlib.h>`, which turns a decimal string into an `int`. `atoi` cannot report bad input: it returns 0 both for `"0"` and for `"abc"`. The safer `strtol`, also in `<stdlib.h>`, stores in an end pointer the place where conversion stopped, so the program can check that the whole string was a number. The version below uses it.

```c
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    char *end;
    long x;
    long y;

    if (argc != 4) {
        return 1;
    }
    x = strtol(argv[2], &end, 10);
    if (end == argv[2] || *end != '\0') {
        return 1;
    }
    y = strtol(argv[3], &end, 10);
    if (end == argv[3] || *end != '\0') {
        return 1;
    }
    printf("Hi %s\n", argv[1]);
    printf("%ld+%ld=%ld\n", x, y, x + y);
    return 0;
}
```

`argv[2]` has type `char *`: it points to text, it is not a number. `argv[2] + argv[3]` does not even compile, because C cannot add two pointers, and printing `argv[2]` with `%d` is undefined behavior. The strings must be converted first; here they become 2 and 3, and the sum is 5.

The test `end == argv[2]` rejects an empty or non-numeric string, and `*end != '\0'` rejects trailing characters such as `"2x"`. A fully robust program would also detect numbers too large for `long` by setting `errno` to 0 before the call and checking it for `ERANGE` afterwards.

:::problem id=worked-omer-sum title="Walk of ./a.out Omer 2 3" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Give `argc`, the four strings, and the lines printed for a successful conversion. State why `argv[2]` cannot be added directly.

:::solution
`argc` is 4. The strings are `"./a.out"`, `"Omer"`, `"2"`, and `"3"`, and `argv[4]` is a null pointer. `strtol` converts the characters of `argv[2]` to 2 and those of `argv[3]` to 3. The program prints `Hi Omer` and then `2+3=5`. `argv[2] + argv[3]` would not compile, because both operands are pointers.
:::
:::

:::check id=chk-argv0
For `./a.out Omer 2 3`, what does `argv[0]` point to?

- [ ] `Omer`
- [x] `./a.out`
- [ ] `2`

The first argument is the program name as it was invoked. `Omer` is `argv[1]`.
:::

## Practice

:::problem id=prac-argc-count title="What argc counts" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The invocation is `./a.out Omer 2 3`.

:::check id=prac-argc-count-q1
`argc` is {{=4|3|5}}.

There are four argument strings. The terminating null pointer is not included in `argc`.
:::

:::check id=prac-argc-count-q2
`argv[1]` points at {{=Omer|./a.out|2}}.

Index 0 is the invocation name. Index 1 is the next argument.
:::

:::check id=prac-argc-count-q3
`argv[4]` is {{=a null pointer|3|Omer}}.

`argv[argc]` is the terminating null pointer. The last argument, `"3"`, is `argv[3]`.
:::
:::

:::problem id=prac-atoi-role title="From the string 2 to the integer 2" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-atoi-role-q1
`atoi("2")` yields {{=2|the pointer to the character array|only the code of the character 2}}.

`atoi` converts the decimal text to an `int`. Its weakness is that `"0"` and invalid text both produce 0.
:::

:::check id=prac-atoi-role-q2
The header for `atoi` and `strtol` is {{=stdlib.h|stdio.h|string.h}}.

`<stdlib.h>` declares both conversions. `<stdio.h>` declares `printf`.
:::

:::check id=prac-atoi-role-q3
If `argc` is not 4, the sample program {{=returns 1 before printing|prints the greeting and a sum anyway|converts argv[0] as an integer}}.

The argument count is tested before any output or conversion. A failed `strtol` check also returns 1.
:::
:::

:::problem id=prac-argv-shape title="Pointers and argument strings" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use the example layout of `./a.out Omer 2 3`.

:::check id=prac-argv-shape-q1
On a typical Unix process, the initial `argv` pointers and strings are placed in the {{=initial stack mapping|heap|.text section}}.

The loader writes them there before `main` starts. C itself guarantees only the pointer array, the modifiable strings, and the final null pointer, not where they live.
:::

:::check id=prac-argv-shape-q2
The example address changes by 5 from `"Omer"` to `"2"` because

- [x] `"Omer"` contains four characters plus a terminating NUL
- [ ] `argc` is 5
- [ ] Every argument occupies 5 bytes regardless of its length

The earlier gap of 8 is the same calculation for `"./a.out"`, including its NUL. The numbers 100 and 1000 are only example addresses.
:::

:::check id=prac-argv-shape-q3
Which statements are true?

- [x] `argv[i]` is a pointer, and the characters occupy a separate array
- [x] The argument strings are modifiable by the program
- [ ] `argv[2]` stores the `int` 2 directly
- [ ] The argument strings are required to reside in `.rodata`

`argv[2]` holds a pointer to the text `"2"`; the integer 2 exists only after a conversion such as `strtol`. `.rodata` holds the program's string literals, not its arguments.
:::
:::

That completes Lecture 1: how values are represented, how wide each type is, how pointers and arrays address memory, how structures are laid out, and how a C file becomes a running process that receives its arguments. The heap from [Programs and processes](topic:source-to-process), with `malloc` and `free`, comes in a later lecture.
