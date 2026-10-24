# 02 — Types

In lesson 01 every variable was an `int`. This lesson shows the other basic kinds of values. In C, the kind of a value is called its **type**. You will also learn to ask the compiler how many bytes each type uses.

## Why types matter

Inside the computer, every value is stored as a row of **bytes**. A byte is a small unit of memory that holds a number from 0 to 255. The type tells the compiler two things:

1. How many bytes the value uses.
2. How to read those bytes: as a whole number, as a number with a fraction, or as a letter.

For example, `7 / 2` on two `int`s gives `3`, because whole numbers have no fraction. The same division on two `double`s, `7.0 / 2.0`, gives `3.5`. The type decides which one you get.

## The types you will use first

| Type | What it stores | Example | Size on this machine |
| --- | --- | --- | --- |
| `char` | One character, stored as a small number | `'A'` | 1 byte |
| `int` | A whole number, positive or negative | `-42` | 4 bytes |
| `unsigned` | A whole number that is never negative | `42` | 4 bytes |
| `double` | A number with a fractional part | `3.5` | 8 bytes |
| `bool` | `true` or `false` | `true` | 1 byte |
| `void*` | A memory address (lesson 07) | | 8 bytes |

"On this machine" means a 64-bit Mac with Apple silicon. Most 64-bit Linux and Windows machines give the same numbers. The C language itself promises only some of them. For example, it promises that `char` is exactly 1 byte, and that `int` is at least 2 bytes.

`bool` needs a header. Write `#include <stdbool.h>` at the top of the file. That header defines `bool`, `true`, and `false`. When you print a `bool` as a number, `true` is `1` and `false` is `0`.

## Ask `sizeof` instead of guessing

Because sizes can differ between machines, a program should not hard-code them. It asks the compiler with `sizeof`:

```c
printf("%zu\n", sizeof(int));   /* prints 4 on this machine */
```

`sizeof(int)` is the number of bytes an `int` uses. The compiler works it out while compiling, so it costs nothing when the program runs.

The result of `sizeof` has its own type, called `size_t`. It is a whole number that is never negative. To print it, use `%zu` instead of `%d`. If you want to store it in an `int`, write `(int)sizeof(int)`. The `(int)` in front is a **cast**: it converts a value to the type in the parentheses.

## A character is a small number

```c
char letter = 'A';
```

`'A'`, in single quotes, is one character. The computer stores it as a number, called its **character code**. On this machine, and on almost every machine today, the code for `'A'` is 65, `'B'` is 66, and so on.

`printf` can show the same `char` both ways:

```c
printf("%c is code %d\n", letter, letter);   /* A is code 65 */
```

`%c` prints the value as a character. `%d` prints it as a number.

Single and double quotes are different in C. `'A'` is one character. `"A"`, in double quotes, is a **string**: a row of characters. Lesson 06 explains strings.

## What the demo prints

```text
sizeof(char) = 1
sizeof(int) = 4
sizeof(double) = 8
sizeof(bool) = 1
sizeof(void*) = 8
sizeof(int) == sizeof(unsigned) is 1
true is 1
letter A is code 65
```

The line `sizeof(int) == sizeof(unsigned) is 1` compares two sizes. `==` gives `1` when they are equal and `0` when they are not. Lesson 03 covers `==`.

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with a `return` statement. A function whose job is a size should use `sizeof`, not a number you looked up. Then:

```bash
make try LESSON=02-types
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [expressions](../03-expressions/lesson.md), where you combine values with operators such as `/`, `%`, and `==`.
