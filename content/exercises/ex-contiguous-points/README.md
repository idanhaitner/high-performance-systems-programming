---
title: Make all the points in one block
---

Asking `malloc` for each small record separately costs a call per record, a few extra bytes per record, and records scattered across memory. Asking once for one block that holds all of them avoids all three.

A point is `typedef struct { int x, y; } Point;`. Write `make_points(n)`. It asks `malloc` **once** for a block of `n` points, sets point `i` to `x = i` and `y = 2 * i`, and returns the address of the block. When `n` is 0 or less, or when `malloc` returns `NULL`, it returns `NULL`. The caller frees the block with a single `free`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `make_points(3)`

**Output:** a block holding the points (0, 0), (1, 2), (2, 4)
:::

:::hint
`Point *pts = malloc(n * sizeof(*pts));` asks for room for `n` points.
:::

:::hint
Check `pts == NULL` before you use it, and return `NULL` in that case.
:::

:::hint
Fill the block with a loop: `pts[i].x = i;` and `pts[i].y = 2 * i;`.
:::

:::case name="three points"
The points are (0, 0), (1, 2), and (2, 4).
:::

:::case name="many points"
With 1,000 points, the last one is (999, 1998).
:::

:::case name="zero points"
Asking for 0 points gives `NULL`.
:::
