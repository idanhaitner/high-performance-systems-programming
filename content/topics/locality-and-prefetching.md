---
id: locality-and-prefetching
title: Locality and prefetching
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

A cache works well only for programs that use memory in a certain way. The name for that way is **locality**. This lesson explains the two kinds of locality, how the processor guesses what you will read next, and how to count the cache lines a loop touches, which is the best way to predict its speed.

## Two kinds of locality

**Temporal locality** means: data used recently is likely to be used again soon. **Spatial locality** means: data near an address you just used is likely to be used soon.

```c
for (int i = 0; i < n; i++)
    sum += a[i];
```

This small loop shows both:

- `sum` is used on every pass of the loop. It is used again and again within a short time, so it stays in the processor, which is temporal locality.
- `a[0]`, `a[1]`, `a[2]`, and so on are neighbors in memory, and the loop reads them one after the other. That is spatial locality.

A cache is built for exactly this. It **keeps recent lines** (temporal locality), and it **fetches neighboring bytes together** in a line (spatial locality). A program with good locality gets many hits. A program that jumps around gets many misses.

:::check id=chk-which-locality
Which kind of locality does reading `a[0]`, then `a[1]`, then `a[2]` show?

- [ ] Temporal, because the loop repeats
- [x] Spatial, because the addresses are neighbors
- [ ] Neither, because each element is read only once

Each read is next to the previous one in memory, which is spatial locality. Temporal locality would mean reading the *same* address again.
:::

## Prefetching: the processor guesses ahead

Waiting for a miss is slow, so the processor tries to avoid it. A **hardware prefetcher** watches the addresses your program reads. When it sees a pattern, it fetches the next lines **before** you ask for them, so they are already in the cache when you need them.

| Pattern of addresses | Can the prefetcher guess it? |
| --- | --- |
| Sequential: `a[0]`, `a[1]`, `a[2]`, ... | Yes, it is easy to predict. |
| Regular stride: every 16th element | Often yes, because the distance is always the same. |
| Irregular: `A[index[i]]`, with `index` jumping around | Hard, because the next address depends on data. |

```c
for (int i = 0; i < N; i++)
    sum += A[i];            /* sequential */

for (int i = 0; i < N; i += 16)
    sum += A[i];            /* regular stride */

for (int i = 0; i < N; i++)
    sum += A[index[i]];     /* irregular */
```

**Prefetching has a limit.** The prefetcher can hide the waiting time, but it still moves whole lines. If your loop uses only 4 bytes out of every 64-byte line, the other 60 bytes still travel through the memory system for nothing. Prefetching can reduce the **latency**, the waiting time, but it cannot recover the **bandwidth**, the amount of data moved, that was wasted by using lines badly.

## Count cache lines, not loads

Here is the most useful habit of the lecture. To predict how a loop behaves in the cache, do not count how many values it reads. Count **how many different cache lines it touches.**

Assume `sizeof(int)` is 4 bytes, one line is 64 bytes, and the array starts at the beginning of a line. Look at two loops, each of which does 16 loads:

```c
for (int i = 0; i < 16; ++i)
    sum += a[i];            /* version 1 */

for (int i = 0; i < 16; ++i)
    sum += a[i * 16];       /* version 2 */
```

- **Version 1** reads `a[0]` to `a[15]`. That is 16 neighbors, 64 bytes, **one** cache line.
- **Version 2** reads `a[0]`, `a[16]`, `a[32]`, and so on. Each one is 16 × 4 = 64 bytes after the previous one, so each read is in a **different** line: 16 lines.

Both loops issue 16 loads. One touches 1 line, and the other touches 16. Their cache traffic is very different, and so is their speed.

## Stride controls how much of each line you use

The **stride** is the distance, in elements, between one access and the next. A loop such as

```c
for (size_t i = 0; i < N; i += stride)
    sum += a[i];
```

has stride `stride`. In 4-byte `int`s with 64-byte lines, one line holds 16 elements. The larger the stride, the fewer of those 16 you use:

![Five rows of 16 squares, each row one cache line of 16 ints. Stride 1 colors all 16 squares. Stride 2 colors 8. Stride 4 colors 4. Stride 8 colors 2. Stride 16 colors only 1.](../assets/figures/stride-lines.svg)

| Stride | Ints used from each line | Share of the line used |
| --- | --- | --- |
| 1 | 16 | all of it |
| 2 | 8 | half |
| 4 | 4 | a quarter |
| 8 | 2 | an eighth |
| 16 | 1 | a sixteenth |

With stride 1, every byte that arrives is used. With stride 16, 15 out of every 16 ints in each line arrive for nothing. Once the stride reaches 16, every access lands in a new line, and making the stride even bigger does not use the lines any better. It only wastes more.

This is exactly what the stride lab of [Lecture 1](topic:why-low-level) measured: the same work, taking longer, because the program used the cache lines badly.

:::check id=chk-stride-lines
A loop reads every 4th `int` of a long array (stride 4). One cache line holds 16 `int`s. How many of the 16 values in a line does the loop use?

- [ ] 16
- [x] 4
- [ ] 1

Stride 4 reads elements 0, 4, 8, and 12 of each line, so 4 out of 16. The other 12 values arrive in the cache but are never used.
:::

:::trap
Judging a loop by how many values it reads. Two loops can read the same number of values and still differ by a factor of 10 in the cache lines they move. Count the lines.
:::

## Practice

:::problem id=prac-count-lines title="Count the lines" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
Take `int a[64];` stored from the start of a cache line. An `int` is 4 bytes, and a line is 64 bytes, so a line holds 16 `int`s. `a` therefore spans 4 lines.

:::check id=prac-count-lines-q1
`for (int i = 0; i < 64; i++) sum += a[i];` touches {{=4|64|16}} different lines.

It reads all 64 elements, one after the other. The 64 `int`s fill 4 lines, so only 4 lines are touched.
:::

:::check id=prac-count-lines-q2
`for (int i = 0; i < 64; i += 16) sum += a[i];` touches {{=4|1|16}} different lines.

It reads only `a[0]`, `a[16]`, `a[32]`, and `a[48]`. Each one is in a different line, so all 4 lines are touched. The loop reads just 4 values, but it moves as many lines as the loop that reads all 64.
:::

:::check id=prac-count-lines-q3
`for (int i = 0; i < 16; i++) sum += a[i * 4];` has stride 4 and reads values up to `a[60]`. It touches {{=4|16|1}} lines.

The indexes go 0, 4, 8, ..., 60. They cover the whole array, so all 4 lines are touched, even though only 16 of the 64 values are read.
:::
:::

:::problem id=prac-pattern-guess title="Can the prefetcher help?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
:::check id=prac-pattern-guess-q1
Which loop is hardest for a hardware prefetcher?

- [ ] `sum += a[i];`
- [ ] `sum += a[i * 8];`
- [x] `sum += a[next[i]];`, where `next` holds unpredictable numbers

The first two have a fixed distance between accesses, so a prefetcher can learn the pattern. In the third, each address comes from data, so nothing can be predicted before it is read.
:::
:::

**Next:** [Loop order, layout, and blocking](topic:efficient-c) puts all of this to work on real code.
