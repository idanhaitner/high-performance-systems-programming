---
title: Count the words after the program's name
---

`argc` counts every word on the command line, and that count includes the program's own name.

Write a program that prints how many words were typed **after** the program's name, then a newline.

You are done when Test shows all three cases passing.

:::example
**Input:** `./count`

**Output:** `0`
:::

:::example
**Input:** `./count hello`

**Output:** `1`
:::

:::example
**Input:** `./count a b c`

**Output:** `3`
:::

:::hint
`argv[0]` is the program's own name, and `argc` counted it too. How do you leave it out?
:::

:::hint
Print `argc - 1`.
:::
