---
title: Report the median of several runs
---

One run of a program can be slow by chance, because the computer is busy with something else. So a fair benchmark runs the code several times and reports the median: sort the times, and take the one in the middle. One unlucky run cannot move it much.

Write `median_time(times, n)`. The array `times` holds `n` measured times, and `n` is odd, from 1 to 15. Return the median. Do not change the array `times`: copy the numbers into your own array first, and sort the copy.

You are done when Submit shows all three cases passing.

:::example
**Input:** `median_time(times, 5)`, where `times` is {12, 11, 30, 12, 13}

**Output:** 12, because sorted they are 11, 12, 12, 13, 30, and 12 is in the middle
:::

:::example
**Input:** `median_time(times, 1)`, where `times` is {7.5}

**Output:** 7.5
:::

:::hint
Make a local array `double sorted[15];` and copy the `n` times into it.
:::

:::hint
Sort the copy with a simple sort. One way: for each new number, move bigger numbers one place to the right until you find its spot, and put it there.
:::

:::hint
When `n` is odd, the middle of the sorted numbers is at position `n / 2`. For 5 numbers that is position 2, the third one.
:::

:::case name="five runs with one slow one"
The slow run of 30 does not move the median, which is 12.
:::

:::case name="one run"
With a single time, the median is that time.
:::

:::case name="times are not changed"
The array you were given must keep its order. Sort a copy, not the original.
:::
