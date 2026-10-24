# 03 — Expressions

Lesson 02 introduced the types of values. This lesson combines values with **operators** such as `+`, `/`, `%`, `==`, and `++`. A piece of code that computes a value, such as `5 / 2` or `year + 1`, is called an **expression**.

Most operators work as they do in math. Three of them surprise beginners, and those are the subject of this lesson.

## Integer division drops the fraction

```c
5 / 2    /* 2, not 2.5 */
5 % 2    /* 1 */
```

When both numbers are `int`s, `/` gives a whole number. It throws the fractional part away. So `5 / 2` is `2`. This is called **integer division**.

It always cuts toward zero. For a negative result, that means rounding up, not down: `-5 / 2` is `-2`, not `-3`.

`%` gives the **remainder**: what is left over after the division. `5 / 2` is `2` with `1` left over, so `5 % 2` is `1`.

C makes `/` and `%` fit together: `(a / b) * b + (a % b)` is always `a`. Check it with `-5` and `2`: `(-2) * 2 + (a % b)` must be `-5`, so `-5 % 2` is `-1`. The remainder has the same sign as the first number.

Why care? Integer division is the source of many silent bugs. `average = sum / count` loses the fraction when both are `int`s.

Dividing by zero, with `/` or `%`, is **undefined behavior**: the language makes no promise about what happens. The program might crash or give any answer. Never do it.

## `=` stores, `==` compares

```c
int x = 0;
x = 4;       /* stores 4 into x */
x == 4;      /* asks: is x equal to 4? gives 1 for yes, 0 for no */
```

`=` is **assignment**. It stores the value on its right into the variable on its left.

`==` is **comparison**. It does not change anything. It gives `1` when both sides are equal and `0` when they are not. C uses `1` for "true" and `0` for "false".

Mixing them up is a classic bug, because both are legal inside a condition:

```c
/* Bug: this stores 1 in x. The condition is then 1, which counts as true. */
if (x = 1) {
    printf("always\n");
}
```

The compiler accepts this, but with `-Wall` it prints a warning. That warning is one reason to always read the warnings.

## Adding one: `n + 1`, `n++`, and `++n`

Adding one to a variable is so common that C has special operators for it.

```c
int n = 3;
int old = n++;   /* old is 3, then n becomes 4 */

int m = 3;
int now = ++m;   /* m becomes 4, then now is 4 */
```

- `n++` (plus signs **after** the name) gives the **old** value of `n`, and then adds one to `n`.
- `++m` (plus signs **before** the name) adds one to `m` first, and then gives the **new** value.
- `n + 1` gives the sum and does **not** change `n` at all.

When you write `n++;` alone on its own line, the given value is thrown away, so `n++;` and `++n;` do the same thing. The difference only matters when you use the value, as in `int old = n++;`.

Do not change the same variable twice in one expression, as in `n = n++;` or `n++ + n++`. C does not say which change happens first, so this is undefined behavior. Put each `++` in its own statement.

## Numbers that are too big

An `int` has a limited range. On this machine it is about minus 2 billion to plus 2 billion. A calculation whose result does not fit, such as adding 1 to the largest `int`, is called **overflow**. For signed integers like `int`, overflow is undefined behavior. Do not write a program that overflows on purpose to see what happens.

## What the demo prints

```text
5 / 2 = 2
5 % 2 = 1
-5 / 2 = -2
-5 % 2 = -1
after assignment, x = 4
3 == 4 is 0
4 == 4 is 1
n++ gave 3, and n is now 4
++m gave 4, and m is now 4
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. Then:

```bash
make try LESSON=03-expressions
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [control flow](../04-control-flow/lesson.md), where conditions like `x == 4` decide which code runs.
