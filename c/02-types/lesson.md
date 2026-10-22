# 02 — Types

A type says what a value is and how many bytes it occupies. The compiler uses the type to decide what an operation means.

## The types you will use first

| Type | What it stores | Size on this machine |
| --- | --- | --- |
| `char` | A small integer, often a character code | 1 byte |
| `int` | A signed integer | 4 bytes |
| `unsigned` | An integer that is never negative | 4 bytes, the same width as `int` |
| `double` | A floating-point number | 8 bytes |
| `bool` | `true` or `false` | an integer width, and `true` is `1` |
| `void*` | An address, taught in the pointers lesson | 8 bytes |

`bool` comes from `<stdbool.h>`. Without that header, C has no `bool` keyword.

`sizeof(char)` is 1 on every machine. The other sizes are properties of this machine, not of the C language. A program that needs the size asks `sizeof`. It does not paste a number from a book.

```c
printf("%zu\n", sizeof(int));
```

`%zu` is the `printf` conversion for a `sizeof` result. `%d` is the conversion for an `int`.

## A character is a small integer

```c
char letter = 'A';
```

`'A'` is a character constant. It has a numeric code. On this machine that code is 65, which the demo prints. The quotes in `"'A'"` are the character. The quotes in `"A"` are a string, which is the next lesson's neighbor and the arrays lesson's subject. A string is more than one `char`.

## What the demo prints

```text
sizeof(char) = 1
sizeof(int) = 4
sizeof(double) = 8
sizeof(void*) = 8
sizeof(int) == sizeof(unsigned) is 1
true is 1
letter A is code 65
```

Those sizes are the sizes on this machine.

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. A function whose job is a size should call `sizeof`. Then:

```bash
make try LESSON=02-types
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [expressions](../03-expressions/lesson.md).
