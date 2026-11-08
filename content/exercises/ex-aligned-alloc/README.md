---
title: Hand out aligned memory
---

A block of 8-byte values must start at an address that is a multiple of 8. An allocator that hands out memory from one array therefore has to skip a few bytes before a block when the counter is not on a multiple of 8.

The array `arena` has 64 bytes and starts at a suitable address, so an offset that is a multiple of `ALIGNMENT` gives an address that is a multiple of it too. `next_offset` says how many bytes of the array are used. Write `my_malloc(size)`. It skips the bytes needed to reach a multiple of `ALIGNMENT` and returns the address of the next `size` bytes. After that, `next_offset` is the end of the block.

It returns `NULL`, and changes nothing, when `size` is 0 or when the skipped bytes and the block do not both fit in what is left. Do not use `next_offset + size` in a comparison, because a huge `size` can wrap around.

You are done when Submit shows all five cases passing.

:::example
**Input:** `my_malloc(5)`, and then `my_malloc(8)`, on a fresh arena

**Output:** the first call returns the address of `arena[0]`, the second returns the address of `arena[8]`, and `next_offset` is 16
:::

:::example
**Input:** `my_malloc(8)`, and then `my_malloc(8)`

**Output:** no bytes are skipped, so the second block starts at `arena[8]`
:::

:::hint
The remainder `next_offset % ALIGNMENT` says how far past a multiple you are. If it is 0, skip nothing. Otherwise skip `ALIGNMENT - remainder` bytes.
:::

:::hint
Compute where the block would start, `aligned = next_offset + padding`, before you change anything. The block fits only if `size` is at most `ARENA_SIZE - aligned`.
:::

:::case name="first block starts the arena"
On a fresh arena, nothing has to be skipped.
:::

:::case name="skips to a multiple of 8"
After a block of 5 bytes, the next block starts at 8, not at 5.
:::

:::case name="no skip when already aligned"
After a block of 8 bytes, the counter is on a multiple of 8, so the next block starts right there.
:::

:::case name="too big after padding"
After a block of 5 bytes, 59 bytes are free, so a request for 57 seems to fit. But 3 of those bytes must be skipped first, so only 56 are left. It must fail, and `next_offset` must stay as it was.
:::

:::case name="zero bytes"
Asking for 0 bytes gives `NULL`, and nothing changes.
:::
