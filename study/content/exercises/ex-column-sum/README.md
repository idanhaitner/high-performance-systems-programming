---
title: Add up one column
---

In a table stored row by row, the numbers of one column are not next to each other. They are `cols` positions apart.

Write `column_sum(a, rows, cols, j)`. The array `a` holds a table of `rows` rows and `cols` columns, row by row. The function returns the sum of column `j`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `column_sum(t, 2, 3, 1)`, where `t` is {1, 2, 3, 4, 5, 6}, a table of 2 rows and 3 columns

**Output:** 7, because column 1 holds 2 and 5
:::

:::hint
Go through the rows with a loop. In each row, you need one number: the one in column `j`.
:::

:::hint
The number in row `i`, column `j` is at position `i * cols + j`.
:::

:::hint
Start `sum` at 0, add `a[i * cols + j]` for every `i` from 0 to `rows - 1`, and return `sum`.
:::

:::case name="middle column"
Take one number from each row, always from column `j`.
:::

:::case name="last column"
The last column is `cols - 1`. Every step down the column moves `cols` positions.
:::

:::case name="one row"
With one row, the column holds a single number.
:::
