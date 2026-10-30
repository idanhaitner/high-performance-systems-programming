---
title: Add up the command-line numbers
---

`argc` and `argv` hold the words typed after the program's name, and each word is text that you must turn into a number before you can add it.

This time you write a whole program, with its own `main`. The tests run it as if you had typed the program's name followed by some numbers.

Your program must print the sum of all the numbers after the program's name, then a newline (`\n`).

Remember that `argv[0]` is the program's name, so the numbers are in `argv[1]` up to `argv[argc - 1]`. There may be any number of them, even none. With no numbers the sum is 0.

To turn a word such as `"3"` into the number 3, use `atoi` from `<stdlib.h>`. The tests only give clean whole numbers, so `atoi` is enough here.

You are done when Test shows all three cases passing.

:::example
**Input:** `./sum 3 4`

**Output:** `7`
:::

:::example
**Input:** `./sum`

**Output:** `0`
:::

:::example
**Input:** `./sum -2 5 10`

**Output:** `13`
:::

:::hint
You need to visit every argument, not only `argv[1]`. Which C building block repeats a few lines once for each item?
:::

:::hint
Use a `for` loop with `i` starting at 1 (to skip the program's name) and stopping before `argc`. Start a `sum` variable at 0 before the loop.
:::

:::hint
Inside the loop, convert `argv[i]` with `atoi` and add the result to `sum`. Print `sum` once, after the loop ends.
:::
