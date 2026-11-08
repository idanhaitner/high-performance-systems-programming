---
title: Average without losing the half
---

When both sides of `/` are whole numbers, C throws away the part after the decimal point.

Write the **function** `average(total, count)`. (A function is a named piece of code that receives values and gives back, or **returns**, one answer.) It receives two `int`s and returns their average as a `double`, the C type for numbers with a decimal point.

`count` is never 0 in the tests, so you do not need to handle dividing by zero here.

You are done when Submit shows all three cases passing.

:::example
**Input:** `average(10, 2)`

**Output:** `5.0`
:::

:::example
**Input:** `average(7, 2)`

**Output:** `3.5`
:::

:::example
**Input:** `average(-7, 2)`

**Output:** `-3.5`
:::

:::hint
Writing `return total / count;` looks right, and it fails. The function returns a `double`, but look at the types on the two sides of the `/`. Which kind of division does C choose?
:::

:::hint
The division happens first, between two `int`s, and only then is the already-chopped answer turned into a `double`. The fraction is gone before that. Make at least one side of the `/` a `double` before you divide.
:::

:::hint
One way: store `total` in a new `double` variable, and divide that variable by `count`. When you put an `int` into a `double` variable, C turns it into the same number with a decimal point, so 7 becomes 7.0.
:::

:::case name="7 / 2 is 3.5"
With two `int`s, `7 / 2` is 3: C keeps the whole part and throws away the .5. Divide with a `double` on at least one side, so the .5 is kept.
:::

:::case name="negative total"
`-7 / 2` with two `int`s is -3, because C chops toward zero. With a `double` on one side the answer is -3.5.
:::

:::case name="even split"
10 divided by 2 is exactly 5. Check that you divide `total` by `count`, in that order.
:::
