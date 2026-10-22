# 05 — Functions

A function is a named block of code with inputs and a result. You declare what it takes and what it returns, then you define the body.

## A definition

```c
int twice(int n) {
    return n * 2;
}

int four_times(int n) {
    return twice(twice(n));
}
```

The line `int twice(int n)` is the declaration and the start of the definition. `int` before the name is the return type. `int n` is a parameter. `return` sends a value back to the caller and leaves the function.

A call writes the arguments into the parameters, runs the body, and uses the returned value. `four_times` is a function that calls another function. That is the ordinary way to build a program out of small pieces.

A function needs a declaration before a call. Defining it earlier in the file is a declaration. A later lesson puts the declaration in a header and the body in another file.

## Arguments are copies

```c
int plus_one(int n) {
    n = n + 1;
    return n;
}
```

`plus_one(year)` copies `year` into `n`. The assignment changes the copy. `year` in the caller stays as it was. The demo prints both numbers.

C has no way, in this lesson, to hand a function the caller's own variable. That tool is a pointer, in the pointers lesson. Until then, a function returns the new value and the caller stores it.

```c
year = plus_one(year);
```

## What the demo prints

```text
plus_one returned 2027
year is still 2026
four_times(3) = 12
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=05-functions
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [arrays and strings](../06-arrays-and-strings/lesson.md).
