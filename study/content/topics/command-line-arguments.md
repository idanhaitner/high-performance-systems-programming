---
id: command-line-arguments
title: Command-line arguments
sources:
  - "Lecture 1 - Introduction.pdf"
---

`int main(void)` does not receive command-line parameters. The hosted form `int main(int argc, char *argv[])` does. Each argument is a modifiable string. A number typed after the program name remains text until the program converts it.

## The argument vector

:::definition id=def-argv title="argc and argv" source="Lecture 1 - Introduction.pdf"
`argc` is the number of command-line arguments, including the program name. `argv` is an array of pointers to those argument strings. `argv[argc]` is a null pointer.
:::

```c
int main(int argc, char *argv[]) {
    return 0;
}
```

The strings pointed to by `argv` can be modified by the program. They are not string literals and are not required to occupy `.rodata`. The C standard does not assign them to the stack either. On a typical Unix process, the initial argument vector and its character arrays are placed in the initial stack mapping, but that is a host convention. The addresses below are an example of the pointer relationships, not stable addresses.

For this invocation:

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

`argc` counts the four strings. It does not count the terminating null pointer. The valid argument indexes are therefore 0 through `argc - 1`, and a loop may also stop when it reads the null pointer at `argv[argc]`.

In the example drawing, the pointer vector is at address 1000. The strings occupy 100, 108, 113, and 115. `"./a.out"` contains 8 bytes including its NUL, so the next example string starts at 108. `"Omer"` contains 5 bytes, so the next starts at 113. `"2"` contains 2 bytes, so `"3"` starts at 115.

![An example argument vector. The strings are modifiable, and the addresses are illustrative.](../assets/figures/argv-layout.svg)

:::trap
Treating `argc` as the count of words after the program name. For `./a.out Omer 2 3`, `argc` is 4 because `argv[0]` refers to the invocation name. A check for a name and two numeric arguments is `argc == 4`.
:::

## Conversion

This invocation should print a name and a sum:

```text
./a.out Omer 2 3
Hi Omer
2+3=5
```

`atoi`, declared in `<stdlib.h>`, converts a decimal string to `int`. It has no reliable way to report malformed input: it returns 0 both for the text `"0"` and for text that is not an integer. `strtol` reports the unconverted suffix through its end pointer and can report range errors through `errno`.

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

`argv[2]` has type `char *`. It is not an `int`. Printing it with `%d`, or applying integer `+` to the pointer, uses the pointer value rather than the number represented by the characters. The conversion has to happen first. For this input, the converted values are 2 and 3, and their sum is 5.

A complete range check also tests `errno` for `ERANGE` after clearing it before the call. The end-pointer test above is the part that rejects an empty conversion and trailing characters such as `"2x"`.

:::problem id=worked-omer-sum title="Walk of ./a.out Omer 2 3" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Give `argc`, the four strings, and the lines printed for a successful conversion. State why `argv[2]` cannot be added directly.

:::solution
`argc` is 4. The strings are `"./a.out"`, `"Omer"`, `"2"`, and `"3"`, and `argv[4]` is a null pointer. `argv[2]` points at characters; `strtol` converts those characters to the value 2, and `argv[3]` converts to 3. The program prints `Hi Omer` and then `2+3=5`. Adding the pointers themselves would be pointer arithmetic, not addition of the integers they describe.
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

`atoi` converts the decimal text to an `int`. It is a weak parser because `"0"` and invalid text can both produce 0.
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

That is a host convention. C guarantees the pointer array, the modifiable strings, and the terminating null pointer. It does not assign those strings to `.rodata` or to the heap.
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

The integer used in arithmetic is the result of a conversion such as `strtol`. The pointer cell does not store that integer. `.rodata` is a common place for string literals, not for `argv` strings.
:::
:::

This lecture now connects representation, type width, pointers, structure layout, translation, and process startup. Allocated storage uses the heap region from [Programs and processes](topic:source-to-process). The rules for ownership and lifetime come with `malloc` and `free` in a later lecture.
