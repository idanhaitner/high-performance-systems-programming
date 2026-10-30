---
title: Turn a digit character into its number
---

A `char` holds a character's code, and `'0'` has the code 48, not 0.

Write `digit_value(c)`. It receives a digit character, from `'0'` to `'9'`, and returns the number that digit stands for. So `digit_value('7')` is 7.

C promises that the digit characters have codes in a row: `'0'`, then `'1'`, then `'2'`, and so on.

You are done when Test shows all three cases passing.

:::hint
`'7'` is 7 places after `'0'` in the table of codes. How can you get that distance?
:::

:::hint
Subtract the code of zero: `c - '0'`. Writing `'0'` is clearer than writing 48.
:::

:::case name="seven"
If you got 55, you returned the code of the character. Subtract the code of `'0'`.
:::

:::case name="zero"
`'0'` itself must give 0. If you got 48, you returned the code of the character.
:::

:::case name="nine"
`'9'` must give 9. If you got 57, you returned the code of the character.
:::
