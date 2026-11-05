---
title: Count the cache lines
---

A cache line is 64 bytes. Line 0 holds addresses 0 to 63, line 1 holds addresses 64 to 127, and so on. A value stored in several bytes can sit inside one line, or cross into the next.

Write `lines_touched(addr, bytes)`. It returns how many different cache lines are touched by the `bytes` bytes that start at address `addr`. The value `bytes` is at least 1.

You are done when Submit shows all four cases passing.

:::example
**Input:** `lines_touched(62, 4)`

**Output:** 2, because addresses 62 and 63 are in line 0, and 64 and 65 are in line 1
:::

:::hint
The bytes cover the addresses from `addr` to `addr + bytes - 1`. The last one is not `addr + bytes`.
:::

:::hint
The line of an address is the address divided by 64, ignoring the remainder. Find the line of the first byte and the line of the last byte.
:::

:::hint
Return `last_line - first_line + 1`, where `first_line` is `addr / 64` and `last_line` is `(addr + bytes - 1) / 64`.
:::

:::case name="inside one line"
An `int` at address 60 fills addresses 60 to 63. They are all in line 0.
:::

:::case name="split int"
An `int` at address 62 fills addresses 62 to 65, and crosses from line 0 into line 1.
:::

:::case name="a whole line"
64 bytes starting at address 0 fill line 0 exactly, and not a byte of line 1.
:::

:::case name="a long range"
128 bytes starting at address 32 reach addresses 32 to 159, which touches lines 0, 1, and 2.
:::
