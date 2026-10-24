# 07 — Pointers

Lesson 05 showed that a function gets copies of its arguments, so it cannot change the caller's variables. Lesson 06 showed that an array is passed as an "address". This lesson explains addresses and **pointers**, the variables that hold them. Pointers are how C lets a function change the caller's data, and they are everywhere in systems programming.

## Memory is a row of numbered boxes

Picture the computer's memory as a very long row of boxes, one byte each. Every box has a number, called its **address**. A variable lives in some of those boxes. An `int` uses 4 boxes in a row, and the address of the variable is the number of its first box.

A **pointer** is a variable whose value is an address. It "points at" another variable.

## Taking an address and following it

```c
int year = 2026;
int* p = &year;
*p = 2027;
```

- `&year` gives the address of `year`. `&` is the **address-of** operator.
- `int* p` declares `p` as a pointer to an `int`: it holds the address of an `int`.
- `*p` means "the `int` at the address stored in `p`". Following a pointer like this is called **dereferencing** it.
- `*p = 2027;` writes 2027 into the `int` at that address. That `int` is `year`, so `year` is now 2027.

The `*` symbol has two jobs, which confuses everyone at first:

| Code | Where `*` appears | Meaning |
| --- | --- | --- |
| `int* p` | in a declaration | `p` is a pointer to an `int` |
| `*p` | in an expression | the `int` that `p` points at |
| `&year` | | the address of `year` |
| `p = &year` | | make `p` point at `year` |

## Changing the caller's variable

Now a function can change the caller's variable. Pass the variable's address, and the function writes through it:

```c
void set_to(int* p, int value) {
    *p = value;
}

int x = 0;
set_to(&x, 9);   /* x is now 9 */
```

The function still receives a copy, but a copy of the **address**. Both the copy and the original point at the same `x`, so writing through the copy changes `x`.

## Pointers and arrays

Lesson 06 passed arrays as `const int* a` and read them with `a[i]`. Now you can see why that works. The array's name, used as a value, is the address of element 0. `a[i]` means "the element `i` positions after the address `a`". C also lets you write that as `*(a + i)`; the two forms mean the same thing.

## The null pointer

A pointer that points at nothing is called a **null pointer**. You write it as `0` or as `NULL`, which is defined in `<stddef.h>` and in `<stdio.h>`. Functions use it to mean "no value" or "not found".

Dereferencing a null pointer is **undefined behavior**. On most machines the program crashes. So when a pointer might be null, check before you follow it:

```c
int read_or(const int* p, int fallback) {
    if (p == 0) {
        return fallback;
    }
    return *p;
}
```

Never do this:

```c
/* Bug: missing points at nothing, so *missing is undefined behavior. */
int* missing = 0;
*missing = 1;
```

## `const` pointers

`const int* p` means: through `p`, you may read the `int` but not change it. The compiler rejects `*p = 1;` when `p` is a `const int*`.

`const` describes the pointer, not the variable. The same `int` can still be changed through a different pointer that is not `const`, or by its own name. A function that takes a `const int*` is promising its caller "I will only read this".

## What the demo prints

```text
year = 2026
the pointer refers to 2026
after the write, year = 2027
a null pointer was not dereferenced
const view reads 2027
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. `swap_ints` needs a third variable to hold one value while you overwrite it. Then:

```bash
make try LESSON=07-pointers
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [memory](../08-memory/lesson.md), where you ask for memory while the program runs.
