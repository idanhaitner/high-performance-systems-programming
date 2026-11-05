---
title: Read a table stored in one row
---

A table with rows and columns can be kept in one plain array, row by row. With `cols` columns, the cell in row `i` and column `j` is at position `i * cols + j`.

Write `cell(a, cols, i, j)`. The array `a` holds a table of `cols` columns, row by row. The function returns the number in row `i`, column `j`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `cell(t, 3, 1, 0)`, where `t` is {10, 11, 12, 20, 21, 22}, a table of 2 rows and 3 columns

**Output:** 20, the first number of the second row
:::

:::hint
Row 0 uses the first `cols` positions. Row 1 starts right after it. How many positions come before the start of row `i`?
:::

:::hint
Row `i` starts at position `i * cols`. Then move `j` more positions along the row.
:::

:::hint
Return `a[i * cols + j]`.
:::

:::case name="first row"
Row 0 starts at position 0, so the answer is at position `j`.
:::

:::case name="second row"
Row 1 starts at position `cols`, not at position 1.
:::

:::case name="wider table"
Use `cols`, the number of columns of the table you were given, and not a fixed number.
:::
