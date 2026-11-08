---
title: Round an offset up to its boundary
---

A compiler places a member at the next address that is a multiple of the member's alignment. That step is rounding up.

Write `round_up(offset, align)`. It returns the smallest multiple of `align` that is at least `offset`. The value `align` is never 0.

You are done when Submit shows all four cases passing.

:::example
**Input:** `round_up(5, 4)`

**Output:** 8, because 8 is the first multiple of 4 that is 5 or more
:::

:::example
**Input:** `round_up(8, 4)`

**Output:** 8, because 8 is already a multiple of 4
:::

:::hint
Look at the remainder of `offset` divided by `align`. If the remainder is 0, the offset is already on a boundary.
:::

:::hint
Otherwise you need to add `align` minus the remainder. Both cases can be written without an `if` by first adding `align - 1`.
:::

:::hint
Return `(offset + align - 1) / align * align`. The division drops the remainder, and the multiplication goes back to a multiple.
:::

:::case name="needs padding"
5 is between 4 and 8, so the next multiple of 4 is 8.
:::

:::case name="already aligned"
If the offset is already a multiple of `align`, return it unchanged.
:::

:::case name="zero"
0 is a multiple of every number.
:::

:::case name="bigger boundary"
13 rounded up to a multiple of 8 is 16.
:::
