---
title: Count the ticks of a pipeline
---

A processor with a pipeline splits each instruction into `steps` steps, and each step takes one tick of the clock. A new instruction enters the pipeline on every tick. So the first instruction finishes after `steps` ticks, and after that one more instruction finishes on every tick. Nothing ever has to wait.

Write `pipeline_ticks(n, steps)`. It returns how many ticks it takes to run `n` instructions. With no instructions, it takes 0 ticks.

You are done when Submit shows all four cases passing.

:::example
**Input:** `pipeline_ticks(10, 5)`

**Output:** 14, because the first instruction needs 5 ticks and the other 9 need one tick each
:::

:::example
**Input:** `pipeline_ticks(1, 5)`

**Output:** 5
:::

:::hint
Count the first instruction on its own: it needs `steps` ticks.
:::

:::hint
Each of the other `n - 1` instructions adds one tick.
:::

:::hint
Do not forget the case `n == 0`. The formula for the other cases would give `steps - 1` there, which is wrong.
:::

:::case name="ten instructions"
10 instructions in a 5-step pipeline take 14 ticks.
:::

:::case name="one instruction"
A single instruction takes as many ticks as there are steps.
:::

:::case name="no instructions"
Running nothing takes 0 ticks.
:::

:::case name="a million instructions"
For a long program, the answer is only a little more than the number of instructions.
:::
