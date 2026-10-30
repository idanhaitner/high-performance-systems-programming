---
title: Add up one row of a grid
---

A **grid** (a 2D array) is a table of numbers, and `grid[i][j]` is the number in row `i`, column `j`.

Write `sum_row(grid, row)`. The grid has 3 rows and 4 columns. The function returns the sum of the 4 numbers in the row you are asked for. For example, if row 1 holds 10, 20, 30, 40, then `sum_row(grid, 1)` is 100.

You are done when Test shows all three cases passing.

:::hint
The row number stays the same the whole time. Only the column number changes. Which C building block repeats a line once for each column?
:::

:::hint
Start a `total` at 0. Use `for (int j = 0; j < 4; j++)`, and inside it add `grid[row][j]` to `total`.
:::

:::case name="first row"
1 + 2 + 3 + 4 is 10. If you got 1, the code still reads only the first column. Add `grid[row][j]` inside a loop.
:::

:::case name="middle row"
10 + 20 + 30 + 40 is 100. If you got the sum of a different row, check that you use the `row` you were given, and not a fixed number.
:::

:::case name="negative numbers"
-1 + -2 + 3 + 5 is 5. Negative numbers add the same way as positive ones.
:::
