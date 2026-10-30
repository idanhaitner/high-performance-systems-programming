---
title: Compare two strings yourself
---

Two strings are compared letter by letter, and the first difference decides which comes first.

Write `compare_text(a, b)` without using `<string.h>`. Like `strcmp`, it returns:

- **0** if the two strings are equal,
- a **negative** number if `a` comes first,
- a **positive** number if `b` comes first.

Only the sign matters; any negative or positive number is fine.

You are done when Test shows all four cases passing.

:::example
**Input:** `compare_text("cat", "cat")`

**Output:** `0`
:::

:::example
**Input:** `compare_text("aab", "aaa")`

**Output:** a positive number
:::

:::example
**Input:** `compare_text("aaa", "aaaaa")`

**Output:** a negative number
:::

:::hint
Walk both strings together with one index `i`, starting at 0. Keep going while `a[i]` is not the end marker `'\0'` and `a[i] == b[i]`.
:::

:::hint
When the loop stops, position `i` is the first place where the strings differ, or where `a` ended. The answer is decided there.
:::

:::hint
Return `a[i] - b[i]`. If both strings ended together, both are `'\0'`, and the difference is 0.
:::

:::case name="equal strings"
"cat" and "cat" are equal, so the answer must be 0. If you got something else, check that the loop stops at the end marker of both strings.
:::

:::case name="differ in the last letter"
"aab" against "aaa": the first two letters match, and `'b'` is bigger than `'a'`, so the answer is positive. If you got 0, you only compared the first letter.
:::

:::case name="one is shorter"
"aaa" against "aaaaa": after three equal letters, `a` ends. `'\0'` (0) is smaller than `'a'`, so the answer is negative.
:::

:::case name="the empty string"
"" against "a": the empty string comes first, so the answer is negative. And "a" against "" is positive.
:::
