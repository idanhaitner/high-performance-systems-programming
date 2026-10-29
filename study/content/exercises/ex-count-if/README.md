---
title: Count with a function you are given
---

This exercise practices "Passing a function to a function" from the lesson "Pointers to functions". A function can receive the address of another function and call it.

Write `count_if(a, n, keep)`. It looks at each of the `n` `int`s in `a`, calls `keep` on it, and counts how many times `keep` says yes. `keep` is a pointer to a function that receives one `int` and returns an `int`: 1 for "yes, count it" and 0 for "no". For example, with

```c
int is_even(int x) { return x % 2 == 0; }
int a[] = {1, 2, 3, 4};
```

`count_if(a, 4, is_even)` returns 2, because two elements (2 and 4) are even.

`count_if` must not know or care which question it is asking. The tests pass it different functions: "is it even?", "is it negative?", and "is it bigger than 100?".

The starter always returns 0. Press Test first and see which cases fail.

You are done when Test shows all four cases passing.

:::hint
Look at the parameter `int (*keep)(int)`: `keep` is a variable that holds a function's address. You call it just like a function: `keep(a[i])`.
:::

:::hint
Start a counter at 0. Loop over every element, and when `keep(a[i])` is not 0, add 1 to the counter.
:::

:::hint
After the loop, return the counter. Do not compare the elements yourself (for example `a[i] % 2 == 0`): then the "negative" and "bigger than 100" questions would give wrong answers.
:::

:::case name="even numbers"
In {1, 2, 3, 4} the even numbers are 2 and 4, so the answer is 2. If you got 0, you never called `keep` or never added to the counter.
:::

:::case name="negative numbers"
In {-3, 5, -1, 0, 8} the negative numbers are -3 and -1, so the answer is 2. If you got 3, you probably tested "is it even?" yourself instead of calling `keep`.
:::

:::case name="bigger than 100"
In {50, 150, 250} two numbers are bigger than 100. Your code should get this right without changing, just by calling the `keep` it was given.
:::

:::case name="empty array"
With n = 0 there is nothing to count, so the answer is 0.
:::
