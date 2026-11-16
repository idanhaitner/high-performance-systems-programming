---
title: How much does speeding up one part save?
---

When you make one part of a program faster, only that part's time shrinks. The rest of the program takes as long as before.

Write `new_total(total, share, speedup)`. A program takes `total` seconds. One part of it uses the fraction `share` of that time, a number from 0 to 1. That part is made `speedup` times faster, and `speedup` is at least 1. Return how many seconds the whole program takes now.

You are done when Submit shows all three cases passing.

:::example
**Input:** `new_total(100, 0.10, 10)`

**Output:** 91, because the part took 10 seconds and now takes 1, and the other 90 seconds stay
:::

:::example
**Input:** `new_total(100, 0.75, 2)`

**Output:** 62.5
:::

:::hint
The part takes `total * share` seconds. The rest takes `total - total * share` seconds.
:::

:::hint
After the change, the part takes `total * share / speedup` seconds.
:::

:::hint
Add the two pieces: the rest, which did not change, and the faster part.
:::

:::case name="small part, big speedup"
Making a part that is 10% of the time ten times faster saves only 9 seconds out of 100.
:::

:::case name="big part, small speedup"
Making the part that is 75% of the time twice as fast saves 37.5 seconds out of 100.
:::

:::case name="no speedup"
With a speedup of 1, nothing changes.
:::
