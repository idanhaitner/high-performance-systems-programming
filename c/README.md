# C for High-Performance Systems Programming

This path is for a student who has taken Introduction to Computer Science and is starting High-Performance Systems Programming. You can already think about a value, a choice, a loop, and a function. You do not need to have written C.

The course site is [High-Performance Systems Programming](https://idanhaitner.github.io/high-performance-systems-programming/).

## How to study one lesson

1. Read `lesson.md`.
2. Run the demo and read the source next to the output.
3. Open the exercise. Replace each stub with your code.
4. Run the exercise until every line says `[pass]`.
5. If you are stuck after a real attempt, read the solution.

From this directory:

```bash
make run LESSON=01-program
make try LESSON=01-program
```

`make test` runs every finished solution. `make test-asan` runs them again with the address sanitizer, which reports leaks and illegal heap use.

The `static` functions passed to `task` in each exercise are the checker. Replace each `not_implemented` above `main`. Leave `main` and the test functions as they are.

This path was checked with Apple clang 21, which `cc` runs on this machine, in C11. A finished program is a file the operating system runs.

## The path

| Lesson | What you can do after it | Course chapter |
| --- | --- | --- |
| [01 A program](01-program/lesson.md) | Compile `main`, print, and use a variable | 1. Introduction to C and Systems Programming |
| [02 Types](02-types/lesson.md) | Choose `int`, `double`, `char`, and `bool`, and read `sizeof` | 1. Introduction to C and Systems Programming |
| [03 Expressions](03-expressions/lesson.md) | Trust integer division, `==` versus `=`, and `++` | 1. Introduction to C and Systems Programming |
| [04 Control flow](04-control-flow/lesson.md) | Write `if`, `while`, `for`, and `switch` | 1. Introduction to C and Systems Programming |
| [05 Functions](05-functions/lesson.md) | Declare, define, and pass by value | 1. Introduction to C and Systems Programming |
| [06 Arrays and strings](06-arrays-and-strings/lesson.md) | Use an array, a length, and a `'\0'`-terminated string | 2. Pointers, Arrays and Dynamic Memory |
| [07 Pointers](07-pointers/lesson.md) | Take an address, dereference, honor `const`, and reject null | 2. Pointers, Arrays and Dynamic Memory |
| [08 Memory](08-memory/lesson.md) | Place a value on the stack or the heap, and pair `malloc` with `free` | 2. Pointers, Arrays and Dynamic Memory |
| [09 The build](09-build/lesson.md) | Split a header and a `.c` file, and read a linker error | 3. Writing Real C Software |
| [10 Structs](10-structs/lesson.md) | Lay out a `struct` and pass a pointer to it | 2. Pointers, Arrays and Dynamic Memory |
| [11 Ownership](11-ownership/lesson.md) | Deep-copy a struct that owns a `malloc` buffer | 2. Pointers, Arrays and Dynamic Memory |
| [12 A growing stack](12-capstone/lesson.md) | Write a stack of ints that grows with `malloc` and is released with `free` | 3. Writing Real C Software |

Lessons 01 through 05 are the language. Lessons 06 through 08 are addresses and the heap. Lessons 09 through 12 are how a real C program is split and how it owns memory.

## Undefined behavior

**Undefined behavior** is a rule the language refuses to define. The compiler may do anything with a program that contains it, including something that looks fine until it does not. Do not write these, and do not run them to see what happens.

- A signed `int` that overflows.
- A read or write past the end of an array.
- A dereference of a null pointer.
- A use of memory after `free`, or a second `free` of the same pointer.
- A return of the address of a local variable.

The address sanitizer used by `make test-asan` catches some of these in a finished solution. It is not a license to try them.
