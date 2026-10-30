---
title: Add up the squares
---

A number lives in a box of fixed size, and a total that grows too big no longer fits.

You will write a **function**. A function is a named piece of code that receives some input values and gives back one answer. Giving back the answer is called **returning** it, and C does it with the word `return`. `main` is the function where a whole program starts; here the tests bring their own, so you do not write `main`. The Test button calls your function for you with a few inputs and checks the answers.

Write `sum_squares(n)`. It must return the sum of the squares from 1 up to `n`, that is, 1×1 + 2×2 + … + n×n.

The function returns a `long long`. That is a whole-number type that takes 8 bytes (64 bits) on the computers you will use; C only promises at least 64 bits. So it can hold numbers with up to 19 digits. On this course's machines it is the same size as `long`.

You will need a **loop**, which repeats the lines inside it. `for (int i = 1; i <= n; i++)` runs once with `i` equal to 1, then 2, and so on up to `n`. (`i++` means "add 1 to `i`".)

You are done when Test shows all three cases passing.

:::example
**Input:** `sum_squares(3)`

**Output:** `14`
:::

:::example
**Input:** `sum_squares(0)`

**Output:** `0`
:::

:::hint
If a big case fails with a negative answer, you added only positive squares and still got a negative total. The lesson showed one way a positive calculation can come out negative.
:::

:::hint
For n = 2000 the true total is about 2.7 billion. The biggest number an `int` can hold is about 2.1 billion. Look at the type of the variable that holds the running total.
:::

:::hint
Give the running total the same 8-byte type that the function returns.
:::

:::case name="n = 2000 needs a bigger type"
The true total is 2 668 667 000, but the biggest `int` is 2 147 483 647. An `int` is only 4 bytes, so the total overflowed its box. For a type that can hold negative numbers, like `int`, that is undefined behavior: the C rules no longer say what happens, and here the total wrapped around to a negative number. Keep the total in a type with 8 bytes.
:::

:::case name="small n"
For n = 3 the answer is 1 + 4 + 9 = 14. Check that the loop starts at 1, stops after `n`, and adds `i * i` each time.
:::

:::case name="n is zero"
When `n` is 0 the loop should not run at all, so the total must start at 0.
:::
