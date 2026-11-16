---
title: Test the mode once, not on every element
---

A filter turns the numbers of `x` into the numbers of `y`. It has two modes, and the mode is the same for the whole array.

Write `filter(n, x, y, mode)`. For every position `i` from 1 to `n - 2`:

- when `mode` is 1, `y[i]` is the smoothed value `(x[i - 1] + 2 * x[i] + x[i + 1]) / 4`,
- otherwise, `y[i]` is the change `x[i] - x[i - 1]`.

Leave `y[0]` and `y[n - 1]` as they are. The arrays `x` and `y` are separate, and `n` is at least 3.

`mode` never changes while the function runs, so test it **once**, before any loop, and then run one of two simple loops. Then no loop has to test it on every element.

You are done when Submit shows all three cases passing.

:::example
**Input:** `filter(5, x, y, 1)`, where `x` is {0, 4, 8, 4, 0}

**Output:** `y[1]`, `y[2]`, `y[3]` are 4, 6, 4
:::

:::example
**Input:** `filter(5, x, y, 0)`, where `x` is {0, 4, 8, 4, 0}

**Output:** `y[1]`, `y[2]`, `y[3]` are 4, 4, -4
:::

:::hint
Start with `if (mode == 1) { ... } else { ... }`, and put a whole loop inside each part.
:::

:::hint
Each loop is `for (int i = 1; i < n - 1; i++)`, so it never touches the first or last position.
:::

:::hint
Use `2 * x[i]` and divide by `4` as written. With `float`s, `/ 4` keeps the fraction.
:::

:::case name="smoothing mode"
With mode 1, each inner value becomes a weighted average of itself and its two neighbors.
:::

:::case name="difference mode"
With any other mode, each inner value becomes the change from the number before it.
:::

:::case name="ends are left alone"
`y[0]` and `y[n - 1]` must keep whatever they held before the call.
:::
