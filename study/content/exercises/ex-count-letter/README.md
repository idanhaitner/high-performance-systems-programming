---
title: Count one letter in a string
---

A string has no stored length, so you walk along it until you reach `'\0'`.

Write `count_letter(text, letter)`. It returns how many times `letter` appears in `text`. For example, `count_letter("banana", 'a')` is 3. A capital letter is a different character, so `count_letter("Aa", 'a')` is 1.

You are done when Test shows all four cases passing.

:::hint
Use a loop over `i` that keeps going while `text[i] != '\0'`. Do not use a fixed length: the strings have different lengths.
:::

:::hint
Inside the loop, if `text[i] == letter`, add 1 to `count`.
:::

:::case name="several"
Check every character and add 1 for each match. If you got 0, the loop never adds to `count`.
:::

:::case name="not there"
With no match, `count` should stay at 0.
:::

:::case name="empty text"
The empty string has `'\0'` as its first character, so the loop should not run at all.
:::

:::case name="capitals are different"
`'A'` and `'a'` have different codes. Compare with `==` and nothing else.
:::
