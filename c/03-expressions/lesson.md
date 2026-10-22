# 03 — Expressions

An expression computes a value. `5 / 2` is an expression. So is `n++`. The type of the operands decides what the operator does.

## Integer division

```c
5 / 2    /* 2 */
5 % 2    /* 1 */
```

When both operands are integers, `/` is integer division. It drops the fractional part. It truncates toward zero, so `-5 / 2` is `-2`, not `-3`.

`%` is the remainder. In C, `a == (a / b) * b + (a % b)`. The remainder takes the sign of `a`, so `-5 % 2` is `-1`.

Dividing by zero is **undefined behavior**. Do not do it.

## Assignment is not comparison

```c
int x = 0;
x = 4;       /* writes 4 into x, and the expression's value is 4 */
x == 4;      /* reads x and produces 1 when it equals 4, otherwise 0 */
```

`=` writes. `==` compares and produces `1` or `0`. A condition written with `=` assigns. This compiles, and it is almost never what you meant:

```c
/* Do not write this. It stores 1 and the condition is true. */
if (x = 1) {
    printf("always\n");
}
```

That program is legal. It is still a bug. The demo prints assignment and comparison separately so you can see which is which.

## Increment

```c
int n = 3;
int old = n++;   /* old is 3, then n is 4 */
int m = 3;
int now = ++m;   /* m becomes 4, and now is 4 */
```

`n++` yields the current value, then adds one. `++m` adds one, then yields the new value. `n + 1` yields the sum and does not change `n`. Use that when you do not want a write.

Changing the same object twice in one expression, with no sequence point between the writes, is **undefined behavior**. Write `n++` as its own statement when you are not sure.

A signed `int` that overflows is also **undefined behavior**. Do not run a program to watch a wrap.

## What the demo prints

```text
5 / 2 = 2
5 % 2 = 1
-5 / 2 = -2
-5 % 2 = -1
after assignment, x = 4
3 == 4 is 0
4 == 4 is 1
post-increment yielded 3 and n is now 4
pre-increment yielded 4 and m is now 4
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=03-expressions
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [control flow](../04-control-flow/lesson.md).
