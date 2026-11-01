---
title: Check before you cut
---

A cast never tells you that it lost part of a number, so careful code checks first.

Write `fits_in_byte(value)`. It returns 1 if converting `value` to a `uint8_t` keeps the number unchanged, and 0 if it would change it. A `uint8_t` is exactly one byte and holds 0 to 255.

You are done when Submit shows all three cases passing.

:::example
**Input:** `fits_in_byte(200)`

**Output:** `1`
:::

:::example
**Input:** `fits_in_byte(300)`

**Output:** `0`, because converting 300 gives 44
:::

:::example
**Input:** `fits_in_byte(-1)`

**Output:** `0`, because converting -1 gives 255
:::

:::hint
You can compare the number with both ends of the range, 0 and 255.
:::

:::hint
Another way: convert the number, then ask whether the result still equals the original.
:::

:::hint
Write `return value >= 0 && value <= 255;`. In C, a true comparison gives 1 and a false one gives 0.
:::

:::case name="values that fit"
Everything from 0 to 255 fits, including both ends.
:::

:::case name="too big"
256 is the first number that needs a ninth bit.
:::

:::case name="negative"
Checking only the upper end is not enough. A `uint8_t` has no negative values.
:::
