---
title: How many bytes to skip
---

A value must start at an address that is a multiple of its alignment, so an allocator sometimes skips a few bytes first. Those skipped bytes are called padding.

Write `padding_for(offset, alignment)`. It returns how many bytes to skip from `offset` to reach the next multiple of `alignment`. If `offset` already is a multiple, it returns 0, not `alignment`.

You are done when Submit shows all four cases passing.

:::example
**Input:** `padding_for(5, 8)`

**Output:** `3`, because the next multiple of 8 after 5 is 8
:::

:::example
**Input:** `padding_for(16, 8)`

**Output:** `0`, because 16 already is a multiple of 8
:::

:::hint
The remainder `offset % alignment` says how far past the last multiple you are.
:::

:::hint
If the remainder is 0, you are already on a multiple. Otherwise you must skip `alignment - remainder` bytes.
:::

:::case name="in the middle"
From 5 with an alignment of 8, the next multiple is 8.
:::

:::case name="already aligned"
From 16 with an alignment of 8, nothing has to be skipped.
:::

:::case name="from zero"
Zero is a multiple of every alignment.
:::

:::case name="other alignments"
The same rule works for 4 and for 16.
:::
