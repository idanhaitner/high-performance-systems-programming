---
title: Count one letter in a string
---

A string has no stored length, so you walk along it until you reach `'\0'`.

Write `count_letter(text, letter)`. It returns how many times `letter` appears in `text`. A capital letter is a different character from the same letter in small form.

You are done when Submit shows all four cases passing.

:::example
**Input:** `count_letter("banana", 'a')`

**Output:** `3`
:::

:::example
**Input:** `count_letter("Aa", 'a')`

**Output:** `1`
:::

:::example
**Input:** `count_letter("hello", 'z')`

**Output:** `0`
:::

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
