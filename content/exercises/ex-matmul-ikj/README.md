---
title: Multiply matrices with the cache-friendly order
---

Two `n` by `n` matrices of `double`s are stored row by row, each in a plain array. The number in row `i`, column `j` is at position `i * n + j`.

Write `multiply(n, A, B, C)`. It puts the product of `A` and `B` in `C`. Use the order **i, k, j** for the three loops, so that the inner loop moves along a row of `B` and a row of `C`. `C` may hold old numbers when the function starts, so clear it first.

You are done when Submit shows all three cases passing.

:::example
**Input:** `multiply(2, A, B, C)`, where `A` is {1, 2, 3, 4} and `B` is {5, 6, 7, 8}

**Output:** `C` is {19, 22, 43, 50}
:::

:::hint
First set all `n * n` numbers of `C` to 0, because the loops will add to them.
:::

:::hint
The loops are `i`, then `k`, then `j`. Read `A[i * n + k]` once into a variable before the inner loop.
:::

:::hint
The inner loop does `C[i * n + j] += aik * B[k * n + j];`, where `aik` is the number you read from `A`.
:::

:::case name="two by two"
For the example, the top left number is 1×5 + 2×7 = 19.
:::

:::case name="identity matrix"
Multiplying by the identity matrix gives the other matrix back.
:::

:::case name="old numbers in C"
`C` starts full of leftovers. The result must not depend on them, so clear `C` before you add to it.
:::
