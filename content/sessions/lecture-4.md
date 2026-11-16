---
id: lecture-4
lecture: lecture-4
title: "Lecture 4 practice: code optimization"
---

:::learn title="How this practice works"
You have read the lessons, so now you use them. Each lesson gets one new question, and most also get a coding exercise. One lab, done on your own computer in VS Code (a free code editor), comes last. It ends with a final exercise that uses everything from these lessons.

Press **Next** when a step is done. If you are stuck, press **Skip for now**, or use the **Reread** link at the top of the step to open that step's lesson.

A coding exercise gives you the function's first line, and the panel on the left says what it must do. You write the rest on the right. **Run** shows what your code prints. **Submit** checks it against small test cases, and all of them must pass. Your code is tidied by itself each time you press either one. Pressing Ctrl+S (Cmd+S on a Mac) does the same as **Run**. The **Assembly** tab shows the machine instructions the compiler made, which is useful in this lecture: you can see whether a loop has a jump in it. If you get stuck, **Hints** opens one hint at a time, and **Solution** shows a finished answer. Try the exercise first, because you learn more that way. To move out of the editor with the keyboard, press Esc and then Tab.

The test cases check that your answer is **correct**, not that it is fast. Timing needs your own machine, and that is what the lab is for.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press one of these buttons.
:::

:::check id=q-where-to-start lesson=measure-first
A profiler shows that a program spends 60% of its time in `sort_rows`, 30% in `read_input`, and 10% in `print_report`. You can make any one of them twice as fast. Which choice saves the most time?

- [x] `sort_rows`, which saves 30% of the total
- [ ] `print_report`, which saves 5% of the total
- [ ] All three save the same, because each becomes twice as fast

Halving a part saves half of its share. Half of 60% is 30%, half of 30% is 15%, and half of 10% is 5%. The biggest part gives the biggest saving.
:::

:::exercise ref=ex-median-time lesson=measure-first
:::

:::exercise ref=ex-new-total-time lesson=measure-first
:::

:::check id=q-same-machine-code lesson=compiler-optimizations
Built with `-O2`, `x * 2` and `x + x` on an `int x` turn into the same machine instructions. What does that tell you?

- [ ] Multiplication is always as fast as addition
- [x] The compiler recognized that both mean the same thing, so the way you wrote it does not decide the speed
- [ ] `-O2` turns off multiplication

The compiler is free to pick any instructions that give the same result. Two ways of writing the same value often end up identical, which is why you measure instead of guessing from the C code.
:::

:::check id=q-pipeline-long lesson=pipeline
A processor has a 4-step pipeline. About how many ticks does it need for 1,000 instructions that never wait for each other?

- [ ] 4,000
- [x] 1,003
- [ ] 250

The first instruction needs 4 ticks. Each of the other 999 adds one tick, so 4 + 999 = 1,003. Without a pipeline, it would be 4 × 1,000 = 4,000.
:::

:::exercise ref=ex-pipeline-ticks lesson=pipeline
:::

:::check id=q-sort-first lesson=branch-prediction
A loop counts how many numbers in a big array are above 100, with `if (a[i] > 100) count++;`. The numbers are random. Someone sorts the array first and the loop becomes much faster, though the sorting itself took longer than the time saved. What sped up the loop?

- [ ] Sorted numbers are smaller, so the comparisons are cheaper
- [x] The test now gives the same answer for long stretches, so the processor guesses it right almost every time
- [ ] Sorting moved the array into the cache

The loop does the same comparisons either way. On sorted data, the test is false for a long run and then true for a long run, so the branch is easy to predict, and there are almost no pipeline flushes. Sorting is only worth it when you need the data sorted anyway, or when you reuse it many times.
:::

:::exercise ref=ex-unswitch-filter lesson=branch-prediction
:::

:::exercise ref=ex-branchless-update lesson=branch-prediction
:::

:::check id=q-alias-twice lesson=compiler-limits
`void twice(int *x, int *y) { *x += *y; *x += *y; }` is called as `twice(&a, &a)` with `a = 2`. What is `a` afterwards?

- [ ] 6
- [x] 8
- [ ] 4

`x` and `y` both point to `a`. The first line makes `a` = 2 + 2 = 4. The second reads the new `a`: 4 + 4 = 8. A version written as `*x += 2 * (*y)` would give 6, which is why the compiler cannot make that change.
:::

:::exercise ref=ex-hoist-strlen lesson=compiler-limits
:::

:::check id=q-chain-length lesson=unrolling-and-accumulators
An array of 1,000 `double`s is added up with eight running totals instead of one, and nothing is left over. How many additions long is the longest chain where each addition waits for the one before, inside the main loop?

- [ ] 1,000
- [x] 125
- [ ] 8

Each of the eight totals gets every eighth number, so each gets 1,000 / 8 = 125 numbers. The eight chains do not wait for each other, so the longest one has 125 additions.
:::

:::exercise ref=ex-unroll-by-four lesson=unrolling-and-accumulators
:::

:::exercise ref=ex-four-sums lesson=unrolling-and-accumulators
:::

:::check id=q-one-change lesson=optimization-playbook
You make three changes to a slow function at once, and it becomes 20% faster. What is the problem with this?

- [ ] Nothing, because 20% is a good result
- [x] You do not know which change helped, and one of them may even have made it slower
- [ ] Changes only count if each one doubles the speed

Changes interact, and some do nothing or make things worse. Making one change at a time, and measuring after each, tells you what really helped.
:::

:::exercise ref=ex-filtered-sum lesson=optimization-playbook
:::

:::exercise ref=ex-transform-rows lesson=optimization-playbook
:::

:::exercise ref=ex-contiguous-points lesson=optimization-playbook
:::

:::lab ref=lab-branches-and-chains lesson=optimization-playbook
:::
