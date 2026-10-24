# C for High-Performance Systems Programming

This path teaches C from zero, for a student starting High-Performance Systems Programming. You should already know what a value, a choice (`if`), a loop, and a function are from an introductory programming course. You do not need to have written C before.

The course site is [High-Performance Systems Programming](https://idanhaitner.github.io/high-performance-systems-programming/).

## What is in each lesson folder

Every lesson folder has four files:

| File | What it is for |
| --- | --- |
| `lesson.md` | The explanation. Read it first. |
| `demo.c` | A short, finished program that shows the idea. Run it and read it next to its output. |
| `exercise.c` | Functions for you to write. Each one has a comment that says what it must do. |
| `solution.c` | A finished copy of the exercise, with comments that explain each step. Open it only after a real attempt. |

## How to study one lesson

Open a terminal in this `c` folder. Then:

1. Read `lesson.md`.
2. Run the demo and compare the source with what it prints:

   ```bash
   make run LESSON=01-program
   ```

3. Open `exercise.c`. Each function you must write contains a line like `not_implemented("subtract");`. Delete that line and write the function body in its place.
4. Run your exercise:

   ```bash
   make try LESSON=01-program
   ```

5. Repeat until every line says `[pass]`.
6. If you are stuck after a real attempt, read `solution.c`.

`make try` compiles your file again whenever you changed it since the last run, so you never have to run the compiler by hand.

### Reading the checker's output

Every exercise ends with a small checker. It calls your functions with known inputs and compares the answers. Each line it prints starts with one of three tags:

- `[pass]`: your function returned the right answer.
- `[fail]`: your function ran but returned something else. The next line says what was expected and what you returned.
- `[todo]`: the function still contains `not_implemented(...)`. You have not written it yet.

Everything from the first `static void test_...` function down to the end of the file is the checker. Do not change it. Write only inside the functions above it.

## Practice

The [practice](practice/README.md) folder has ten levels of exercises for writing C yourself, from printing your name to exam-style questions such as binary search and linked lists. Start with:

```bash
make practice LEVEL=01-printing
```

## Other commands

| Command | What it does |
| --- | --- |
| `make test` | Runs every finished solution. Use it to check that the path itself works. |
| `make test-asan` | Runs every solution again with the **address sanitizer**. That is a compiler option that adds checks around every memory access. It stops the program with a report when it sees a read past the end of an array, a use of memory after `free`, or a second `free`. |
| `make leaks LESSON=08-memory` | Runs your exercise and reports any memory you allocated and never released. Useful from lesson 08 on. |
| `make test-leaks` | The same leak check for every solution. |
| `make clean` | Deletes the `build` folder, where all compiled programs go. |

On macOS the address sanitizer cannot find leaks, so the two leak commands use the `leaks` tool that ships with macOS. On Linux the address sanitizer finds leaks by itself, so the leak commands run it instead.

This path was checked with Apple clang 21 (the compiler that the `cc` command runs on a Mac), using the 2011 version of C, called C11.

## The path

| Lesson | What you can do after it | Course chapter |
| --- | --- | --- |
| [01 A program](01-program/lesson.md) | Compile and run a program, print text, and use a variable | 1. Introduction to C and Systems Programming |
| [02 Types](02-types/lesson.md) | Choose between `int`, `double`, `char`, and `bool`, and ask `sizeof` how big each is | 1. Introduction to C and Systems Programming |
| [03 Expressions](03-expressions/lesson.md) | Predict integer division, tell `==` from `=`, and use `++` | 1. Introduction to C and Systems Programming |
| [04 Control flow](04-control-flow/lesson.md) | Write `if`, `while`, `for`, and `switch` | 1. Introduction to C and Systems Programming |
| [05 Functions](05-functions/lesson.md) | Write a function, call it, and know that it gets copies of its arguments | 1. Introduction to C and Systems Programming |
| [06 Arrays and strings](06-arrays-and-strings/lesson.md) | Use an array with its length, and a string that ends in `'\0'` | 2. Pointers, Arrays and Dynamic Memory |
| [07 Pointers](07-pointers/lesson.md) | Take an address, follow it, use `const`, and check for null | 2. Pointers, Arrays and Dynamic Memory |
| [08 Memory](08-memory/lesson.md) | Put a value on the stack or the heap, and pair every `malloc` with a `free` | 2. Pointers, Arrays and Dynamic Memory |
| [09 The build](09-build/lesson.md) | Split a program into a header and a `.c` file, and read a linker error | 3. Writing Real C Software |
| [10 Structs](10-structs/lesson.md) | Group fields into a `struct` and pass a pointer to it | 2. Pointers, Arrays and Dynamic Memory |
| [11 Ownership](11-ownership/lesson.md) | Copy a struct that owns heap memory without sharing that memory | 2. Pointers, Arrays and Dynamic Memory |
| [12 A growing stack](12-capstone/lesson.md) | Write a stack of ints that grows with `malloc` and is released with `free` | 3. Writing Real C Software |

Lessons 01 to 05 are the core language. Lessons 06 to 08 are addresses and memory. Lessons 09 to 12 are how a real C program is split into files and how it manages memory.

## Undefined behavior

Most languages stop with an error when you do something illegal, such as reading past the end of an array. C often does not check. Instead, the C standard says some mistakes have **undefined behavior**: the language makes no promise at all about what happens next. The program may crash, print garbage, or seem to work today and fail tomorrow on another machine.

So do not write these, and do not run them "to see what happens". What you see proves nothing.

- An `int` calculation whose result is too large or too small for an `int`. This is called **overflow**.
- A read or write past either end of an array.
- Following a null pointer, a pointer that points at nothing (lesson 07).
- Using memory after `free`, or calling `free` twice on the same memory (lesson 08).
- Returning the address of a function's local variable (lesson 08).

`make test-asan` catches some of these in a finished program. It does not catch all of them, so it is a safety net, not a license to try them.
