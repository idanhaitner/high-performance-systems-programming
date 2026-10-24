# 01 — A program

This lesson takes you from an empty file to a running program. You will learn what a C source file is, how the compiler turns it into a program, where the program starts, and how to store a number in a variable.

## From text to a running program

A C program starts as a plain text file whose name ends in `.c`. Your computer cannot run that text directly. A program called the **compiler** reads the text and translates it into machine instructions. It writes those instructions to a new file, called an **executable**. You then run the executable.

So there are always two steps:

1. Compile: `demo.c` → executable file.
2. Run the executable file.

This matters because editing `demo.c` changes nothing until you compile again. The executable is a separate file made from the old text.

## The smallest program

```c
#include <stdio.h>

int main(void) {
    printf("Hello\n");
    return 0;
}
```

Line by line:

- `#include <stdio.h>` pastes in a file called a **header**. This header tells the compiler that a function named `printf` exists and how to call it. Without this line, the compiler does not know `printf`.
- `int main(void) {` starts a function named `main`. Every C program has exactly one `main`. When you run the program, it starts at the first line inside `main`. `void` in the parentheses means `main` takes no inputs here.
- `printf("Hello\n");` prints the text between the quotes. `\n` is the **newline** character: it moves the output to the next line. Without it, the next text would start on the same line.
- `;` ends a **statement**. A statement is one instruction. Forgetting the `;` is the most common beginner compile error.
- `return 0;` ends `main` and hands the number 0 back to the operating system. By convention `0` means "finished successfully" and any other number means "something went wrong". The `int` before `main` says that `main` returns an integer.
- `{` and `}` mark a **block**: a group of statements that belong together. Here the block is the body of `main`.

## Compile and run it

From the `c` folder:

```bash
make run LESSON=01-program
```

`make` is a tool that runs the commands written in the `Makefile`. For this lesson, it runs these two commands for you:

```bash
cc -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -g -I include -o build/01-program-demo 01-program/demo.c
./build/01-program-demo
```

The first command is the compiler. Its options mean:

- `cc` is the C compiler.
- `-std=c11` uses the 2011 version of the C language.
- `-Wall -Wextra -Wpedantic` turn on **warnings**. A warning is the compiler saying "this is legal, but it looks like a mistake". Read every warning. It is often a real bug.
- `-Wno-unused-parameter` turns off one warning that the unfinished exercises would trigger.
- `-g` stores extra information that debugging tools use to show line numbers.
- `-I include` tells the compiler to look for headers in the `include` folder. The exercise checker lives there.
- `-o build/01-program-demo` names the executable that the compiler writes.

The second command runs that executable. The `./` at the start means "the file at this path, starting from the current folder". Without it, the shell would look for an installed command with that name.

## Printing a number

`printf` can print numbers inside text:

```c
printf("year = %d\n", year);
```

`%d` is a placeholder. `printf` replaces it with the value of the next argument, `year`, written as a whole number. Each `%d` in the text needs one matching value after the text.

## A variable

A **variable** is a named box that holds one value. In C you must say what kind of value the box holds before you use it.

```c
int year = 2026;
year = year + 1;
```

- `int year = 2026;` creates a box named `year` that holds an `int`, a whole number. It puts `2026` in it. Creating a variable is called **declaring** it.
- `year = year + 1;` reads `year` (2026), adds 1, and stores the result (2027) back into `year`.

`=` means "store into". It is not a question about equality. Checking whether two values are equal uses `==`, which lesson 03 covers.

A variable lives only inside the block where it is declared. After the closing `}`, the name no longer exists. You also cannot declare the same name twice in one block. The compiler reports that as an error.

## What the demo prints

```text
A C program starts in main.
year = 2026
after adding 1, year = 2027
```

## Reading the exercise functions

The exercise asks you to finish small functions. Lesson 05 explains functions in detail. For now, you only need to read one:

```c
int add(int a, int b) {
    return a + b;
}
```

- `int add` names the function `add` and says it gives back an `int`.
- `(int a, int b)` says it takes two `int` inputs, called `a` and `b`.
- `return a + b;` computes `a + b` and gives that value back to whoever called `add`.

So `add(2, 3)` gives back `5`.

## Exercise

Open `exercise.c`. Each unfinished function contains a line like:

```c
not_implemented("subtract");
```

Delete that line. In its place, write a `return` statement that gives back what the comment above it describes. Then run:

```bash
make try LESSON=01-program
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means your function ran but returned the wrong value; the line under it shows the expected and actual values. Keep going until every line says `[pass]`. The finished version is `solution.c`.

Next: [types](../02-types/lesson.md), where you learn what kinds of values a variable can hold.
