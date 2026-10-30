---
title: Grow an array safely
---

If `realloc` fails, `a = realloc(a, ...)` overwrites your only copy of the old address with `NULL`.

Write `grow_and_fill(a, old_n, new_n, fill)`. The heap block `a` holds `old_n` `int`s. Make it hold `new_n` `int`s, and store `fill` in each of the new places. Return the block's address, which may have moved. For example, growing {1, 2} to 4 elements with `fill` 7 gives {1, 2, 7, 7}.

Do this in two parts:

1. Keep what `realloc` returns in a second variable, `bigger`. If `bigger` is `NULL`, return `NULL`. The caller still has `a`, and it is still valid.
2. Store `fill` in the places from `old_n` up to `new_n - 1`.

The tests cannot make `realloc` fail, so nothing checks part 1 for you. It is worth doing right anyway. The starter does neither part. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
Replace the starter's line with `int *bigger = realloc(a, new_n * sizeof(int));`, followed by the check for `NULL`. Remember that `realloc` takes the new total size in bytes.
:::

:::hint
Use a loop with `i` from `old_n` up to, but not including, `new_n`, and write `bigger[i] = fill;`. Then return `bigger`.
:::

:::case name="keeps the old values"
`realloc` keeps the old values by itself. Your loop must start at `old_n`, so it does not overwrite them.
:::

:::case name="fills the new places"
`realloc` does not fill the new room. Store `fill` in each new place with a loop.
:::

:::case name="grows a lot"
Ask for `new_n * sizeof(int)` bytes, not `new_n` bytes. `realloc` takes a size in bytes.
:::
