---
title: Grow an array safely
---

If `realloc` fails, `a = realloc(a, ...)` overwrites your only copy of the old address with `NULL`.

Write `grow_and_fill(a, old_n, new_n, fill)`. The heap block `a` holds `old_n` `int`s. Make it hold `new_n` `int`s, and store `fill` in each of the new places. Return the block's address, which may have moved. For example, growing {1, 2} to 4 elements with `fill` 7 gives {1, 2, 7, 7}.

If `realloc` fails, return `NULL`, and leave the old block usable for the caller. The tests cannot make `realloc` fail, so nothing checks this for you. It is worth doing right anyway.

You are done when Test shows all three cases passing.

:::hint
Keep the answer in a second variable: `int *bigger = realloc(a, new_n * sizeof(int));`, followed by the check for `NULL`. Remember that `realloc` takes the new total size in bytes.
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
