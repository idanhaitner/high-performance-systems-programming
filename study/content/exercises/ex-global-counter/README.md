---
title: Keep a count in a global variable
---

A **global** variable, written outside every function, lives for the whole run. A **local** variable, written inside a function, is created fresh on each call and is destroyed when the function returns.

Here `total_calls` is a global. Other code reads it, so it must be the one that counts. Fix `count_call()` so that each call adds 1 to the global `total_calls`.

You are done when Test shows all three cases passing.

:::example
**Input:** `count_call();` called once, when `total_calls` is 0

**Output:** `total_calls` is 1
:::

:::example
**Input:** `count_call();` called three times in a row, when `total_calls` starts at 0

**Output:** `total_calls` is 3
:::

:::hint
Which line creates a new variable inside the function? A line that begins with a type, such as `int`, creates one.
:::

:::hint
Delete the line `int total_calls = 0;` inside the function. Then `total_calls` means the global one.
:::

:::case name="one call"
If it is still 0, the function changed a local variable with the same name, not the global.
:::

:::case name="three calls"
Each call should add 1 to the same global variable.
:::

:::case name="adds to the current value"
Do not reset the global inside the function. Only add 1 to it.
:::
