---
id: lecture-4
lecture: lecture-4
title: "Lecture 4 practice: code optimization"
---

:::learn title="How this practice works"
This practice goes over the main ideas of the lecture: a few quick questions, a few coding exercises, and one lab at the end that you do on your own computer in VS Code, a free code editor.

In an exercise, the panel on the left says what the function must do, and you write it on the right. **Run** shows what your code prints, and **Submit** checks it against small tests. If you are stuck, open **Hints** one at a time, or use the **Reread** link to open the step's lesson.

The tests check that your answer is correct, not that it is fast. Timing needs your own computer, and that is what the lab is for.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press **Run** or **Submit**.
:::

:::check id=q-where-to-start lesson=measure-first
A profiler shows that a program spends 60% of its time in `sort_rows`, 30% in `read_input`, and 10% in `print_report`. You can make any one of them twice as fast. Which choice saves the most time?

- [x] `sort_rows`, which saves 30% of the total
- [ ] `print_report`, which saves 5% of the total
- [ ] All three save the same, because each becomes twice as fast

Halving a part saves half of its share. Half of 60% is 30%, half of 30% is 15%, and half of 10% is 5%. The biggest part gives the biggest saving.
:::

:::check id=q-same-machine-code lesson=compiler-optimizations
Built with `-O2`, `x * 2` and `x + x` on an `int x` turn into the same machine instructions. What does that tell you?

- [ ] Multiplication is always as fast as addition
- [x] The compiler recognized that both mean the same thing, so the way you wrote it does not decide the speed
- [ ] `-O2` turns off multiplication

The compiler is free to pick any instructions that give the same result. Two ways of writing the same value often end up identical, which is why you measure instead of guessing from the C code.
:::

:::check id=q-sort-first lesson=branch-prediction
A loop counts how many numbers in a big array are above 100, with `if (a[i] > 100) count++;`. The numbers are random. Someone sorts the array first and the loop becomes much faster, though the sorting itself took longer than the time saved. What sped up the loop?

- [ ] Sorted numbers are smaller, so the comparisons are cheaper
- [x] The test now gives the same answer for long stretches, so the processor guesses it right almost every time
- [ ] Sorting moved the array into the cache

The loop does the same comparisons either way. On sorted data, the test is false for a long run and then true for a long run, so the branch is easy to predict, and there are almost no pipeline flushes. Sorting is only worth it when you need the data sorted anyway, or when you reuse it many times.
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

:::exercise ref=ex-four-sums lesson=unrolling-and-accumulators
:::

:::check id=q-one-change lesson=optimization-playbook
You make three changes to a slow function at once, and it becomes 20% faster. What is the problem with this?

- [ ] Nothing, because 20% is a good result
- [x] You do not know which change helped, and one of them may even have made it slower
- [ ] Changes only count if each one doubles the speed

Changes interact, and some do nothing or make things worse. Making one change at a time, and measuring after each, tells you what really helped.
:::

:::exercise ref=ex-contiguous-points lesson=optimization-playbook
:::

:::lab ref=lab-branches-and-chains lesson=optimization-playbook
:::
