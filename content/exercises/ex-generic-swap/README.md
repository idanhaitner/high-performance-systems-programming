---
title: Swap two values of any type
---

A function that knows only an address and a number of bytes can move the contents of any value, whatever its type.

Write `generic_swap(a, b, size)`. It swaps the `size` bytes that start at `a` with the `size` bytes that start at `b`. The tests call it with `int`s, `double`s, and a small structure, so the function must not care what the bytes mean. The two values never overlap.

You are done when Submit shows all four cases passing.

:::example
**Input:** `int x = 10, y = 20; generic_swap(&x, &y, sizeof x);`

**Output:** `x` is 20 and `y` is 10
:::

:::example
**Input:** `double p = 1.5, q = 9.25; generic_swap(&p, &q, sizeof p);`

**Output:** `p` is 9.25 and `q` is 1.5
:::

:::hint
A `void *` cannot be followed, and it cannot be indexed. Store each address in an `unsigned char *` first. A pointer to `unsigned char` steps through memory one byte at a time.
:::

:::hint
Loop `size` times. In each step, swap byte number `i` of the first value with byte number `i` of the second, using one `unsigned char` as a temporary.
:::

:::hint
`unsigned char *pa = a;` needs no cast, because a `void *` converts by itself.
:::

:::case name="swaps ints"
Four bytes each, so pass `sizeof` of one of the `int`s.
:::

:::case name="swaps doubles"
Eight bytes each. The same code must work, with only the size changing.
:::

:::case name="swaps only size bytes"
If `size` is 2, only the first 2 bytes of each value trade places. The bytes after them stay where they were.
:::

:::case name="swaps a structure"
A structure is just bytes too. All of its members must trade places.
:::
