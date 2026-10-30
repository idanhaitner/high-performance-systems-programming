---
title: Swap two numbers through pointers
---

If `p` holds the address of `x`, then writing to `*p` changes `x` itself.

When you call a **function** (a named piece of code that receives values), C hands it **copies** of the values you pass. If the function changes its copy, the caller's variable stays the same. So a function that wants to change the caller's variables must receive their **addresses** instead. This is exactly why `scanf`, the function that reads a number you type, needs `&x`: it gets the address of `x` and writes the number into that box.

Write `swap(a, b)`. Here `a` and `b` are pointers to `int`: `a` holds the address of one variable and `b` holds the address of another. After the call, the two variables must have traded values. For example:

```c
int x = 3;
int y = 8;
swap(&x, &y);
/* now x is 8 and y is 3 */
```

The function returns nothing, which C writes as `void`. Its only job is to change the two boxes.

The starter code swaps two local copies, so the caller sees no change. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
Inside `swap`, `x` and `y` are new boxes that only hold copies. Changing them does not reach the caller. Which expression is the caller's first box itself?
:::

:::hint
`*a` is the box `a` points to, which is the caller's first variable. `*b` is the second. Write the new values into `*a` and `*b`.
:::

:::hint
As soon as you store into `*a`, its old value is gone. The starter already saved both values for you: `y` holds the second value and `old_x` holds the first. Store `y` into `*a`, then store `old_x` into `*b`.
:::

:::case name="two positives"
After `swap(&x, &y)` with x = 3 and y = 8, x should be 8 and y should be 3. If both are unchanged, your code only swapped copies. Write through the pointers with `*a = ...` and `*b = ...`.
:::

:::case name="negative and positive"
Negative numbers swap the same way as positive ones. If x is unchanged, the new values never reached the boxes `a` and `b` point to.
:::

:::case name="same value"
When both variables hold 6, swapping should leave both at 6. If one changed, check that you saved the first value before you overwrote it.
:::
