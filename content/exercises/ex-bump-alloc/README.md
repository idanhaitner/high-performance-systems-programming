---
title: Hand out memory from one array
---

A very simple allocator keeps one big array and a counter. Each request takes the next piece of the array and moves the counter forward.

The array `arena` has 64 bytes, and `next_offset` says how many bytes were already handed out. Write `my_malloc(size)`. It returns the address of the next `size` bytes of the array and moves `next_offset` forward by `size`. It returns `NULL`, and changes nothing, when `size` is 0 or when fewer than `size` bytes are left. Do not worry about alignment yet.

You are done when Submit shows all five cases passing.

:::example
**Input:** `my_malloc(8)` on a fresh arena

**Output:** the address of `arena[0]`, and `next_offset` is 8
:::

:::example
**Input:** `my_malloc(8)`, and then `my_malloc(16)`

**Output:** the second call returns the address of `arena[8]`, and `next_offset` is 24
:::

:::hint
`&arena[next_offset]` is the address of the first byte that is still free.
:::

:::hint
Check first, and change the counter last. A request that fails must leave `next_offset` as it was.
:::

:::hint
The number of free bytes is `ARENA_SIZE - next_offset`. Compare `size` with that, instead of adding `size` to the offset, so a huge `size` cannot wrap around.
:::

:::case name="first block starts the arena"
On a fresh arena, the first block starts at `arena[0]`.
:::

:::case name="blocks follow each other"
Each block starts exactly where the last one ended, with no gap.
:::

:::case name="too big returns NULL and changes nothing"
Asking for more bytes than are free gives `NULL`, and `next_offset` keeps its value.
:::

:::case name="uses every last byte"
A request for exactly the free bytes that are left must succeed.
:::

:::case name="zero bytes"
Asking for 0 bytes gives `NULL`.
:::
