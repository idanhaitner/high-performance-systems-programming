---
title: Reorder the members to save memory
---

The compiler never reorders the members of a structure, so you choose how much padding there is.

Here is `struct Record`. On a typical machine it takes 24 bytes, and most of that is padding. Change the order of the members so that `sizeof(struct Record)` is 16. Keep all four members, with their names and types.

You are done when Submit shows both cases passing.

:::example
**Input:** the members `char active; double value; int id; char type;`

**Output:** `sizeof(struct Record)` is 24, so it is too big
:::

:::hint
Where does the padding come from? Each member must start at a multiple of its own size. A `double` is the strictest, with 8.
:::

:::hint
Put the biggest member first, so it needs no padding before it. Then the `int`.
:::

:::hint
Use the order `double value; int id; char active; char type;`. The members use 14 bytes, and the total is rounded up to 16.
:::

:::case name="smaller size"
Put the members in order from the biggest to the smallest.
:::

:::case name="members kept"
All four members must still be there, with the same names and types.
:::
