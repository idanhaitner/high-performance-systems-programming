# 08 — Memory

Lesson 07 showed that every variable lives at an address. This lesson is about **how long** a variable lives. A function's local variables disappear when it returns. When data must outlive the function, or when you only learn how much you need while the program runs, you ask for memory yourself with `malloc` and give it back with `free`.

## Two places for data

```text
stack (the function's local variables)
  boxed        a pointer, 8 bytes
heap (memory you asked for with malloc)
  [ 42 ]       the int that boxed points at
```

- The **stack** holds each function's local variables. When a function is called, it gets a fresh area on the stack, called its **stack frame**. When the function returns, the frame is thrown away, along with every local variable in it. This is automatic.
- The **heap** is a large pool of memory that you manage by hand. You ask for a block with `malloc`. It stays yours until you hand it back with `free`, no matter which function is running.

## The stack

```c
int local_year(void) {
    int year = 2026;
    return year;
}
```

`year` is created when `local_year` starts and destroyed when it returns. That is fine here, because `return year;` copies the **value** 2026 back to the caller. The caller's copy is separate.

Returning the **address** of a local variable is a serious bug:

```c
/* Bug: year is destroyed when the function returns. */
int* dangling(void) {
    int year = 2026;
    return &year;
}
```

The caller receives an address of memory that no longer belongs to `year`. Such a pointer is called **dangling**. Using it is **undefined behavior**. The compiler warns about this case.

## The heap: `malloc` and `free`

Both functions are declared in `<stdlib.h>`.

```c
int* boxed = malloc(sizeof(int));
if (boxed == 0) {
    return 1;
}
*boxed = 42;
free(boxed);
```

Line by line:

- `malloc(sizeof(int))` asks for a block big enough for one `int`. `malloc` takes a number of **bytes**, which is why the code asks `sizeof` instead of writing 4.
- `malloc` returns the address of the new block. Its return type is `void*`, which means "an address of an unknown type". C converts it to `int*` automatically when you store it in `boxed`.
- If the computer has no memory to give, `malloc` returns the null pointer. Always check for that before using the block.
- `*boxed = 42;` writes into the block, exactly as with any pointer.
- `free(boxed)` hands the block back. You must pass the same address that `malloc` returned.

The new block's contents start as garbage. `malloc` does not set them to zero, so write a value before you read one.

For an array of `n` ints, ask for `n` times the size of one:

```c
int* p = malloc((size_t)n * sizeof(int));
```

`size_t` is the type `sizeof` gives: a whole number that is never negative, made for sizes. Converting `n` to `size_t` first means the multiplication is done in that type. You then use `p[0]` to `p[n - 1]` like a normal array.

## Rules for `free`

After `free(p)`, the variable `p` still holds the old address, but that memory is no longer yours. The rules:

- Reading or writing through `p` after `free` is undefined behavior. This bug is called **use after free**.
- Calling `free` twice on the same block is undefined behavior. This bug is called a **double free**.
- `free(0)`, freeing the null pointer, is allowed and does nothing.

## Leaks

A block you never `free` is a **memory leak**. Nothing crashes, but the program holds memory it can no longer use. A long-running program that leaks a little on every request will eventually run out.

The rule: every `malloc` needs exactly one matching `free`, on every path out of the function. If the function returns the block to its caller, as `box_int` in the exercise does, the duty to `free` passes to the caller.

To check your exercise for leaks, run:

```bash
make leaks LESSON=08-memory
```

At the end it prints a line such as `0 leaks for 0 total leaked bytes`. Any other count means some block was never freed.

## What the demo prints

```text
local_year returned 2026
heap value = 42
the heap int was released
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. The tests release the memory that `box_int` and `fill_range` return. `sum_range` must release its own memory before it returns. Then:

```bash
make try LESSON=08-memory
make leaks LESSON=08-memory
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [the build](../09-build/lesson.md), where a program is split into several files.
