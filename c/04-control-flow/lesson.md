# 04 — Control flow

So far every program ran its lines from top to bottom, each one once. **Control flow** changes that. It lets a program choose which lines to run (`if`, `switch`) and repeat lines (`while`, `for`). Lesson 03 showed that a comparison like `n > 0` gives `1` or `0`. Here those values decide what runs.

## A choice: `if`

```c
if (n > 0) {
    return 1;
} else if (n < 0) {
    return -1;
} else {
    return 0;
}
```

C checks the conditions in order. It runs the block of the first one that is true and skips the rest. The final `else` runs when no condition was true.

In C, a condition is any number. **Zero means false. Any other number means true.** Comparisons such as `>`, `<`, `==`, and `!=` (not equal) give `1` or `0`, so they fit naturally.

To combine conditions, use `&&` for "and" and `||` for "or". For example, `n >= 0 && n <= 9` is true when `n` is a single digit.

## A loop: `while`

A loop runs a block again and again. `while` checks its condition. If the condition is true, it runs the body once and checks again. When the condition becomes false, the loop ends.

```c
int sum = 0;
int i = 0;
while (i < n) {
    sum = sum + i;
    i = i + 1;
}
```

Follow it with `n = 3`:

| Check `i < 3` | Body does | `sum` after | `i` after |
| --- | --- | --- | --- |
| `0 < 3` true | `sum = 0 + 0` | 0 | 1 |
| `1 < 3` true | `sum = 0 + 1` | 1 | 2 |
| `2 < 3` true | `sum = 1 + 2` | 3 | 3 |
| `3 < 3` false | loop ends | 3 | 3 |

When `n` is 0, the first check is already false. The body never runs, and the sum stays 0.

Every loop needs something in its body that moves it toward the end. Here, `i = i + 1` does that. Without it, `i` stays 0 forever and the program never finishes.

## A counting loop: `for`

Most loops count. `for` puts the three counting parts in one line: the start, the condition, and the step.

```c
int product = 1;
for (int k = 1; k <= n; k = k + 1) {
    product = product * k;
}
```

Read the header as: "start with `k = 1`; while `k <= n`, run the body; after each run, do `k = k + 1`". This loop computes `1 * 2 * ... * n`. When `n` is 0, the body never runs, and the product stays 1.

The variable `k` is declared inside the `for` header, so it exists only inside the loop.

## Choosing by value: `switch`

When you compare one value against many fixed numbers, `switch` is clearer than a long chain of `if`s.

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

`switch` jumps straight to the `case` whose number equals `n`. If no `case` matches, it jumps to `default`.

After a `case` runs, C does **not** stop at the next `case` label. It keeps running into the next case's code. This is called **fall-through**, and it is a common bug. To leave the `switch`, end each case with `break;`. A `return` also leaves, because it leaves the whole function. The example above uses `return`. The demo uses `break`.

The return type of the example function is `const char*`. That is how C writes "a piece of text". Lessons 06 and 07 explain it. For now, read it as "this function returns text".

## What the demo prints

```text
sign of -3 is -1
sum below 4 = 6
product of 1..4 = 24
label is one
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. Then:

```bash
make try LESSON=04-control-flow
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [functions](../05-functions/lesson.md), where you split a program into small named pieces.
