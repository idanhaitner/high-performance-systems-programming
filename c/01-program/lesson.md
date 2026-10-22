# 01 — A program

A C program is a text file the compiler translates into a program the operating system can run. This lesson is that file, the compiler, and `main`.

## The smallest program

```c
#include <stdio.h>

int main(void) {
    printf("Hello\n");
    return 0;
}
```

`main` is where execution starts. It returns `int`. `0` means the program finished successfully. A non-zero value means it failed. The shell shows that value only if you ask (`echo $?` after the program exits).

`#include <stdio.h>` pastes the header that declares `printf`. `printf` writes to standard output. `"Hello\n"` is text ending in a newline. A statement ends with `;`.

Braces `{ }` form a block. A name declared inside a block dies at the closing brace.

## Compile it

From this directory:

```bash
make run LESSON=01-program
```

That runs the equivalent of:

```bash
cc -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -I include -o build/01-program-demo 01-program/demo.c
./build/01-program-demo
```

`-std=c11` asks for the 2011 language. `-Wall -Wextra -Wpedantic` turn on warnings. Read a warning. It is often a real bug. `-I include` lets a later file include the exercise checker.

The compiler writes an executable file. You run that file. Editing `demo.c` does nothing until you compile again.

## A variable

```c
int year = 2026;
year = year + 1;
```

The first line creates an `int` named `year` and stores `2026`. The second line reads `year`, adds 1, and stores the result back. `=` is assignment. It writes. Comparison is `==`, in the expressions lesson.

A name is declared once in a block. Declaring `year` twice in the same block is a compiler error.

## What the demo prints

```text
A C program starts in main.
year = 2026
after adding 1, year = 2027
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Replace that call so the function returns the value its comment describes. Then:

```bash
make try LESSON=01-program
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [types](../02-types/lesson.md).
