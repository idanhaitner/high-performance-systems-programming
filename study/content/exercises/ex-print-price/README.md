---
title: Print a line in an exact format
---

Placeholders such as `%d` and `%.2f` say where each value goes and how it looks.

Write a program that reads a whole number and a decimal number, and prints them in one fixed sentence, with 2 digits after the point. Every letter and space counts.

You are done when Test shows all three cases passing.

:::example
**Input:** typing `3 2.5`, then Enter

**Output:** `3 items cost 2.50 each`
:::

:::example
**Input:** typing `10 0.75`, then Enter

**Output:** `10 items cost 0.75 each`
:::

:::hint
Text inside the format string is printed as it is, so the words go right there, around the placeholders.
:::

:::hint
`%f` shows 6 digits after the point. `%.2f` shows 2, and rounds. Try `"%d items cost %.2f each\n"`.
:::
