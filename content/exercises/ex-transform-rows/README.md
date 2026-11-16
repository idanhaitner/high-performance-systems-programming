---
title: Transform a table row by row
---

A table of `rows` by `cols` numbers is stored row by row in a plain array: the number in row `i`, column `j` is at position `i * cols + j`. A loop whose inner index walks along a row reads neighbors in memory, and uses every byte of each cache line.

Write `transform(rows, cols, src, dst)`. For every position `p` of the table, it sets `dst[p]` to `3.0f * src[p] + 2.0f`.

Put the row loop `i` outside and the column loop `j` inside. The arrays `src` and `dst` never overlap, so mark both pointers `restrict` in the first line of the function.

You are done when Submit shows all three cases passing.

:::example
**Input:** `transform(2, 3, src, dst)`, where `src` is {0, 1, 2, 3, 4, 5}

**Output:** `dst` is {2, 5, 8, 11, 14, 17}
:::

:::hint
The first line becomes `void transform(int rows, int cols, const float *restrict src, float *restrict dst)`.
:::

:::hint
The outer loop is `for (int i = 0; i < rows; i++)`, and the inner one is `for (int j = 0; j < cols; j++)`.
:::

:::hint
Inside, `int p = i * cols + j;` and `dst[p] = 3.0f * src[p] + 2.0f;`.
:::

:::case name="two by three"
Every number is multiplied by 3, plus 2.
:::

:::case name="one row"
A table with one row works too.
:::

:::case name="nothing past the end"
Only the `rows * cols` positions of `dst` change.
:::
