---
title: From an array of structures to a structure of arrays
---

An array of structures keeps each point's values together. A structure of arrays keeps all the `x` values together, all the `y` values together, and all the `z` values together. The second layout is better for a loop that scans only one of them.

Write `split_points(p, n, x, y, z)`. The array `p` has `n` points. The function copies every point's values into the three arrays, so that `x[i]`, `y[i]`, and `z[i]` hold the values of `p[i]`. The arrays are big enough for `n` numbers each.

You are done when Submit shows all three cases passing.

:::example
**Input:** `split_points(p, 2, x, y, z)`, where `p[0]` is {1, 2, 3} and `p[1]` is {4, 5, 6}

**Output:** `x` is {1, 4}, `y` is {2, 5}, and `z` is {3, 6}
:::

:::hint
Go through the points with one loop, from 0 to `n - 1`.
:::

:::hint
In each pass, the three values of `p[i]` go to the same position `i` of the three arrays.
:::

:::hint
Inside the loop, write `x[i] = p[i].x;`, `y[i] = p[i].y;`, and `z[i] = p[i].z;`.
:::

:::case name="x values"
`x[i]` should be the `x` of `p[i]`.
:::

:::case name="y and z values"
Fill `y` and `z` in the same loop.
:::

:::case name="nothing extra"
Write only `n` numbers into each array, and not one more.
:::
