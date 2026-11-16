---
title: Measure the length once
---

`strlen(s)` counts the letters of a string by walking it to the `'\0'` at the end. Calling it in the test of a loop walks the whole string again before every iteration, which turns a quick job into a very slow one for long strings.

Write `lower(s)`. It changes every capital letter `'A'` to `'Z'` in the string `s` into the matching small letter, and leaves every other character as it is. Call `strlen` only **once**, before the loop, and keep the answer in a variable.

You are done when Submit shows all three cases passing.

:::example
**Input:** `s` is `"Hello World"`

**Output:** `s` is `"hello world"`
:::

:::example
**Input:** `s` is `"ABC xyz 123!"`

**Output:** `s` is `"abc xyz 123!"`
:::

:::hint
Start with `size_t len = strlen(s);` and loop with `i < len`.
:::

:::hint
A character `c` is a capital letter when `c >= 'A' && c <= 'Z'`.
:::

:::hint
Capital and small letters are the same distance apart in the character table, so `s[i] = s[i] - 'A' + 'a';` turns a capital into its small letter.
:::

:::case name="mixed letters"
Capitals become small letters, and small letters stay small.
:::

:::case name="other characters stay"
Spaces, digits, and punctuation do not change.
:::

:::case name="empty string"
An empty string stays empty.
:::
