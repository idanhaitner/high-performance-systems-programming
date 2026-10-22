# 08 — Memory

Every object lives somewhere. A local variable lives in the function's stack frame and dies when the function returns. A block from `malloc` lives on the heap until you pass it to `free`.

```text
stack frame of main
  boxed        a pointer
heap
  [ 42 ]       the int boxed points at
```

## The stack

```c
int local_year(void) {
    int year = 2026;
    return year;
}
```

`year` is created when `local_year` is called and destroyed when it returns. The `return` copies the value `2026` back to the caller. The caller's copy is a different object.

Returning the address of `year` would hand the caller an address that no longer refers to a live object. Using that address is **undefined behavior**.

```c
/* Do not run this. The returned address dies with the function. */
int* dangling(void) {
    int year = 2026;
    return &year;
}
```

## The heap

```c
int* boxed = malloc(sizeof(int));
if (boxed == 0) {
    return 1;
}
*boxed = 42;
free(boxed);
```

`malloc` asks for a number of bytes and returns the address of that block, or a null pointer if it cannot. Check the null pointer before you write through it. `sizeof(int)` is the byte count of one `int` on this machine.

`free` releases the block. After `free`, the pointer still holds the old address, and that address is no longer yours. Reading or writing through it is **undefined behavior**. So is calling `free` twice on the same block. `free(0)` does nothing, and it is safe.

A block you never `free` is a leak. The program still has the bytes. `make test-asan` reports a leak in a finished solution. The ordinary `make test` does not.

Every `malloc` in a function that does not return the pointer needs a matching `free` on every path that returns, including the path where a later allocation fails.

## What the demo prints

```text
local_year returned 2026
heap value = 42
the heap int was released
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. The tests release what your functions allocate. `sum_range` must release its own memory before it returns. Then:

```bash
make try LESSON=08-memory
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [the build](../09-build/lesson.md).
