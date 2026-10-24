# 05 — Functions

You have already written small functions in the exercises. This lesson explains how they work: what the parts of a function mean, what happens during a call, and why a function cannot change the caller's variables. That last point leads to pointers in lesson 07.

## Why functions

A **function** is a named piece of code. You give it inputs, it does some work, and it gives back a result. Functions let you write a piece of logic once, give it a clear name, and use it from many places. Large programs are built from many small functions.

## The parts of a function

```c
int twice(int n) {
    return n * 2;
}
```

- `int` at the start is the **return type**: the type of the value the function gives back.
- `twice` is the function's name.
- `(int n)` is the **parameter** list. `n` is a variable that holds the input. A function can have several parameters separated by commas, or none, written `(void)`.
- The block `{ ... }` is the **body**: the code that runs.
- `return n * 2;` computes the result, hands it back, and leaves the function immediately.

A function whose return type is `void` gives nothing back. It ends at its closing `}` or at a plain `return;`.

## What happens during a call

```c
int four_times(int n) {
    return twice(twice(n));
}
```

A **call** such as `twice(3)` does three things:

1. It copies the **argument** `3` into the parameter `n`.
2. It runs the body of `twice`.
3. The call is then replaced by the returned value, `6`.

`four_times(3)` first computes the inner `twice(3)`, which is `6`. Then it computes `twice(6)`, which is `12`. Building a function out of other functions like this is the normal way to write C.

## Declare before you call

The compiler reads a file from top to bottom. When it reaches a call, it must already know the function's name, parameters, and return type. That information is called a **declaration**.

A full definition earlier in the file counts as a declaration. That is why the demo defines `twice` above `four_times`, and both above `main`. You can also write the declaration alone, without a body, ending in `;`:

```c
int twice(int n);
```

Lesson 09 puts such declarations in a separate file, called a header.

## Arguments are copies

```c
int plus_one(int n) {
    n = n + 1;
    return n;
}
```

The call `plus_one(year)` copies the value of `year` into `n`. Inside the function, `n = n + 1` changes `n`, which is only the copy. The caller's `year` does not change. This rule is called **pass by value**.

So, with only what you know now, a function cannot change the caller's variable. It returns the new value, and the caller stores it:

```c
year = plus_one(year);
```

Lesson 07 introduces **pointers**, which do let a function change the caller's variable.

## `static` in the demo

The demo writes `static` before its helper functions:

```c
static int twice(int n) { ... }
```

`static` on a function means "this function is used only inside this file". It is a promise that helps the compiler, and it keeps the name from clashing with a function of the same name in another file. Lesson 09 explains files and names. The exercises leave `static` off their functions, and the checker's test functions use it.

## What the demo prints

```text
plus_one returned 2027
year is still 2026
four_times(3) = 12
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. Try to write `four_times` by calling `twice`, instead of repeating the multiplication. Then:

```bash
make try LESSON=05-functions
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [arrays and strings](../06-arrays-and-strings/lesson.md), where one variable holds many values.
