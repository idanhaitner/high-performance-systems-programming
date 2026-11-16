---
id: unrolling-and-accumulators
title: Loop unrolling and multiple accumulators
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
  - "ps4.pdf"
---

In [How the processor overlaps instructions](topic:pipeline) you saw that a pipeline stays busy only when it has **independent** instructions to work on, ones that do not wait for each other. This lesson shows two rewrites that give it more of them. Loop unrolling cuts the bookkeeping of a loop. Multiple accumulators split one long chain of additions into several short ones. Together, they are about getting more work out of **one** processor core at once, which is called **instruction-level parallelism**.

## The hidden cost of a loop

Take a simple loop:

```c
for (int i = 0; i < N; i++)
    B[i] = A[i] * 3 + 7;
```

Each element needs a multiplication and an addition. But every iteration also pays for the loop itself: add 1 to `i`, compare `i` with `N`, and jump back to the top. This bookkeeping is the **loop overhead**. When the useful work is tiny, the overhead is a big part of the total.

## Loop unrolling

**Loop unrolling** means doing several iterations' worth of work in one pass through the loop body. Here is the same loop, unrolled by 4:

```c
int i = 0;
for (; i + 3 < N; i += 4) {
    B[i]     = A[i]     * 3 + 7;
    B[i + 1] = A[i + 1] * 3 + 7;
    B[i + 2] = A[i + 2] * 3 + 7;
    B[i + 3] = A[i + 3] * 3 + 7;
}
for (; i < N; i++)          /* the last 0 to 3 elements */
    B[i] = A[i] * 3 + 7;
```

Read it line by line:

1. `int i = 0;` is declared outside the loops, so the second loop can continue from where the first one stopped.
2. The first loop steps `i` by 4. Its test, `i + 3 < N`, makes sure that all four elements `i`, `i + 1`, `i + 2`, and `i + 3` exist.
3. The body handles four elements, one after another.
4. If `N` is not a multiple of 4, up to 3 elements are left over. The second loop, called the **tail** or **remainder loop**, does those one at a time.

For `N = 10`, the first loop runs with `i = 0` and `i = 4`, covering elements 0 to 7. Then `i` is 8, and `8 + 3 < 10` is false, so it stops. The tail handles elements 8 and 9.

:::check id=chk-unroll-tail place=text
A loop is unrolled by 4, with the test `i + 3 < N` and a tail loop after it. With `N = 13`, how many elements does the tail loop handle?

- [ ] 0
- [x] 1
- [ ] 3

The unrolled loop runs for `i` = 0, 4, and 8, covering elements 0 to 11. Then `i` is 12, and 12 + 3 < 13 is false. The tail handles element 12, just one.
:::

### Why unrolling helps

- **Less bookkeeping.** One increment, one comparison, and one jump now serve four elements instead of one.
- **More independent work.** The four lines in the body do not depend on each other, so the processor can overlap them in its pipeline.

Measured on one machine, 128 passes over about a million integers:

| Loop | Time |
| --- | --- |
| Ordinary | 61.26 ms |
| Unrolled by 4 | 42.58 ms |

That is **1.44 times faster**, from this processor and compiler. These measurements turned off the compiler's own unrolling with `-fno-unroll-loops`, to show the effect of doing it by hand. The compiler can unroll loops by itself, for example with `-funroll-loops`, so in a real program check first whether it already does.

### When unrolling goes too far

Unrolling is a trade. Unrolling by 4 or 8 is usually helpful. Unrolling by 64 is usually not, for three reasons:

- **Bigger code.** The loop body is copied many times. This growth is called **code bloat**.
- **The instruction cache.** Machine instructions are also kept in a cache, the instruction cache. A loop that no longer fits there must fetch its own instructions from slower memory, and can become slower than the original.
- **Too few registers.** The processor has only a few registers. A body that juggles too many values at once has to put some back in memory and fetch them again.

How much is too much depends on the processor, the compiler, and the rest of the code. Measure.

:::check id=chk-unroll-too-far
Someone unrolls a small loop by 128, and it becomes slower than the original. Which is a likely reason?

- [ ] Unrolling changes the result, so the program has to repeat work
- [x] The much bigger loop no longer fits in the instruction cache
- [ ] The processor can only run loops that are unrolled by a power of 2 up to 8

Copying the body 128 times makes the machine code much larger. If it no longer fits in the cache for instructions, fetching the instructions becomes the slow part.
:::

## A chain of additions

Now add up an array of `double`s:

```c
double sum = 0;
for (int i = 0; i < N; i++)
    sum += A[i];
```

Each `sum += A[i]` needs the `sum` from the addition before it. So the additions form one long **dependency chain**: addition 2 cannot start until addition 1 has finished, addition 3 waits for addition 2, and so on. The reads of `A[i]` can happen early, but the additions must go one at a time.

That matters because an addition of `double`s takes a few clock ticks to finish. The processor could **start** a new addition on every tick, as in a pipeline, but only if the next addition does not need the one still in progress. In this loop it always does. So the adder spends most of its time waiting.

## Multiple accumulators break the chain

An **accumulator** is a variable that collects a running total, like `sum`. The idea is to use four of them, each adding up every fourth element:

```c
double s0 = 0, s1 = 0, s2 = 0, s3 = 0;
int i = 0;
for (; i + 3 < N; i += 4) {
    s0 += A[i];
    s1 += A[i + 1];
    s2 += A[i + 2];
    s3 += A[i + 3];
}
double sum = (s0 + s1) + (s2 + s3);
for (; i < N; i++)
    sum += A[i];
```

`s0` collects elements 0, 4, 8, ...; `s1` collects 1, 5, 9, ...; and so on. At the end, the four partial totals are added together, and the tail adds whatever is left.

![Top: one accumulator, a single row of eight additions where each waits for the one before. Bottom: four accumulators s0 to s3, four short rows of two additions each. Each row still waits for itself, but the rows do not wait for each other, so the longest chain is 2 steps instead of 8. Measured: 36.46 milliseconds with one accumulator, 6.90 with four.](../assets/figures/accumulators.svg)

Each of the four rows is still a chain. But the rows are **independent** of each other, so the processor can have four additions in progress at once. The longest chain is now a quarter as long.

Measured, adding 16,384 `double`s 2,000 times (about 33 million additions):

| Version | Time |
| --- | --- |
| One accumulator | 36.46 ms |
| Four accumulators | 6.90 ms |

**5.29 times faster**, on one core, with the same number of additions.

:::definition id=def-ilp title="Instruction-level parallelism" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
**Instruction-level parallelism** is a single processor core working on several independent instructions at the same time, in different stages of its pipeline. Code with fewer dependency chains gives it more to work with.
:::

:::check id=chk-why-accumulators
Four accumulators make an array sum faster, although the number of additions is the same. Why?

- [ ] Four accumulators use four processor cores
- [x] The four running totals do not depend on each other, so several additions can be in progress at once
- [ ] Adding four numbers at once is a single instruction

It still runs on one core, and each addition is still a separate instruction. What changed is that the next addition no longer has to wait for the one just before it.
:::

### Why doesn't the compiler do this itself?

For whole numbers, it often does. But a `double` keeps only about 16 significant digits, so each addition rounds its result a little. Adding the same numbers in a different order can round differently, and the last digits of the answer can change. The compiler promises to keep your program's answer exactly, so it will not reorder additions of `double`s on its own. When you choose four accumulators, **you** accept that the result may differ in the last digits.

In the measurement, the two answers happened to be equal. In general, when you compare such a result with the original, allow a small difference, called a **tolerance**, such as a relative difference of one in a billion.

:::trap
Comparing two floating-point sums with `==` after changing the order of the additions. They can differ in the last digits even when both are correct. Compare with a tolerance instead, for example `fabs(a - b) <= 1e-9 * fabs(b)`.
:::

:::check id=chk-float-order
You change a loop that adds up `double`s to use four accumulators. On a test array, the new total differs from the old one in the 15th digit. What does this most likely mean?

- [ ] The new code has a bug
- [x] The additions happen in a different order, so the rounding is slightly different
- [ ] The processor made an error

A `double` rounds after each addition, so a different order can give slightly different last digits. Both answers are good approximations of the true sum. Check with a small tolerance, not with `==`.
:::

## Practice

:::problem id=prac-unroll-count title="Counting the overhead" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
A loop processes `N = 1,000` elements. Each pass through the loop body does one increment, one comparison, and one jump back.

:::check id=prac-unroll-count-q1
The ordinary loop, one element per pass, does about {{=1,000|250|4,000}} comparisons in the loop test.

One pass per element: 1,000 passes, each with one test. One more test, the one that fails, ends the loop.
:::

:::check id=prac-unroll-count-q2
Unrolled by 4, the main loop does about {{=250|1,000|4}} comparisons.

Each pass covers 4 elements, so 1,000 / 4 = 250 passes. 1,000 is a multiple of 4, so the tail loop has nothing to do.
:::

:::check id=prac-unroll-count-q3
Unrolled by 4 with `N = 1,003`, the tail loop handles {{=3|1|4}} elements.

The main loop covers elements 0 to 999. Elements 1,000, 1,001, and 1,002 are left for the tail.
:::
:::

:::problem id=prac-accumulator-split title="Which accumulator gets which element?" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
An array of 10 numbers is added with four accumulators `s0` to `s3`. The main loop steps by 4 and adds `A[i]` to `s0`, `A[i + 1]` to `s1`, `A[i + 2]` to `s2`, and `A[i + 3]` to `s3`. A tail loop adds what is left.

:::check id=prac-accumulator-split-q1
`A[6]` is added to {{=s2|s0|s3}}.

The main loop runs for `i` = 0 and `i` = 4. When `i` is 4, `A[i + 2]` is `A[6]`, and it goes into `s2`.
:::

:::check id=prac-accumulator-split-q2
`A[9]` is added by {{=the tail loop|s1|s3}}.

The main loop stops after `i` = 4, because 8 + 3 < 10 is false. `A[8]` and `A[9]` are left for the tail.
:::

:::check id=prac-accumulator-split-q3
With one accumulator, the longest chain of additions that wait for each other has 10 steps. With four, the longest chain inside the main loop has {{=2|4|10}} steps.

Each accumulator gets one element when `i` is 0 and one when `i` is 4, so each chain is only 2 additions long.
:::
:::

**Next:** the last lesson puts every technique together, shows how to choose among them, and adds a few lessons about memory.
