---
title: Add up boxes that know their own type
---

A structure can carry a pointer to a function, so each value in an array can come with the code that understands it.

Each `Box` holds the address of a value, `data`, and a function pointer, `to_double`. Calling `to_double` on a box gives the value inside it as a `double`, whether it is an `int` or a `double`. Like any function called through a pointer in a structure, it receives the address of the box.

Write `total(boxes, n)`. It calls each of the `n` boxes' own `to_double` and returns the sum. If `n` is 0, the sum is 0.

You are done when Submit shows all three cases passing.

:::example
**Input:** boxes holding the `int` 3, the `double` 2.5, and the `int` -1

**Output:** `4.5`
:::

:::example
**Input:** `total(boxes, 0)`

**Output:** `0`
:::

:::hint
`boxes[i]` is a whole box, so reach its function with a dot: `boxes[i].to_double`.
:::

:::hint
The function wants the **address** of the box it belongs to. Pass `&boxes[i]`.
:::

:::hint
Do not look at `data` yourself. You do not know its type. Only the box's own function does.
:::

:::case name="adds mixed boxes"
The boxes hold different types, so each one's own function must be used.
:::

:::case name="uses each box's own function"
Two boxes point at the same bytes, but their functions give different answers.
:::

:::case name="no boxes"
With `n` equal to 0, return 0 and do not touch the array.
:::
