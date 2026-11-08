---
title: Keep only the last byte
---

Converting an `int` to a smaller type keeps only the rightmost bits. The bits on the left are thrown away.

`uint8_t` is a whole number type that is exactly one byte and has no negative values, so it holds 0 to 255.

Write `low_byte(value)`. It returns the rightmost byte of `value` as a `uint8_t`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `low_byte(300)`

**Output:** `44`, because 300 is 256 + 44, and the 256 does not fit in one byte
:::

:::example
**Input:** `low_byte(65)`

**Output:** `65`, because 65 already fits
:::

:::hint
A cast is a type name in parentheses in front of a value, such as `(double)x`.
:::

:::hint
Write `return (uint8_t)value;`.
:::

:::case name="a value that fits"
A number from 0 to 255 fits in one byte, so it should come back unchanged.
:::

:::case name="300 is cut down"
Only the last 8 bits stay. Those bits of 300 are `00101100`, which is 44.
:::

:::case name="256 is cut down"
256 is `1` followed by eight zeros, so its last 8 bits are all 0.
:::
