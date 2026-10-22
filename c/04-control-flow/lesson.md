# 04 — Control flow

Control flow is how the program chooses a statement and how many times it runs that statement. The tools are `if`, `while`, `for`, and `switch`.

## A choice

```c
if (n > 0) {
    return 1;
} else if (n < 0) {
    return -1;
} else {
    return 0;
}
```

The condition is an expression. A zero value is false. Any other value is true. `1` and `0` are what `==` and `>` produce, so a comparison fits a condition directly.

## A loop

`while` tests, then runs the body, then tests again.

```c
int sum = 0;
int i = 0;
while (i < n) {
    sum = sum + i;
    i = i + 1;
}
```

When `n` is 0 the body never runs, and the sum stays 0.

`for` packs the setup, the test, and the step into one header. This loop multiplies `1 * 2 * ... * n`. When `n` is 0 the body never runs, and the product stays 1.

```c
int product = 1;
for (int k = 1; k <= n; k = k + 1) {
    product = product * k;
}
```

`k` exists only inside the `for`. A loop that never finishes is a bug. Each of these loops moves `i` or `k` toward the test failing.

## A switch

```c
switch (n) {
case 0:
    return "zero";
case 1:
    return "one";
default:
    return "other";
}
```

`switch` jumps to the `case` whose constant equals `n`. `default` runs when none match. `break` leaves the `switch`. A `return` also leaves it. Without `break`, execution falls into the next case. That is legal, and it is a common bug. This lesson's cases return, so they do not fall through.

## What the demo prints

```text
sign of -3 is -1
sum below 4 = 6
product of 1..4 = 24
label is one
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=04-control-flow
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [functions](../05-functions/lesson.md).
