---
id: efficient-c
title: Loop order, layout, and blocking
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

You now have a model: memory moves in cache lines, a line is used best when you read all of it, and the processor guesses well when your reads follow a pattern. This lesson uses the model on real code. You will see three changes that make a program faster **without changing what it computes** and without changing its big-O cost: the order of the loops, the way records are stored, and working on small blocks.

## Loop order changes the access pattern

Back in [How C lays out data in memory](topic:memory-layout), you saw that `a[i][j]` is stored row by row. Now add up every element of an `R` by `C` table in two ways:

```c
/* Row traversal */
for (int i = 0; i < R; ++i)
    for (int j = 0; j < C; ++j)
        sum += a[i][j];

/* Column traversal */
for (int j = 0; j < C; ++j)
    for (int i = 0; i < R; ++i)
        sum += a[i][j];
```

Both loops read exactly the same elements, and both cost O(R × C). But look at the **inner** loop, the one that runs fastest:

- **Row traversal:** the inner loop changes `j`. Consecutive reads are neighbors in memory: **stride 1**. Each cache line that arrives is used fully before the loop moves on.
- **Column traversal:** the inner loop changes `i`. Consecutive reads are a whole row apart: **stride C**. If a row is long, every read lands in a new cache line, and the line is thrown away before the loop returns to use its other values.

Same elements, same big-O cost, different locality. You measured this in the Lecture 1 lab.

:::check id=chk-inner-loop
`int a[R][C];` is stored row by row. Which loop has stride 1?

- [x] `for (i...) for (j...) sum += a[i][j];`
- [ ] `for (j...) for (i...) sum += a[i][j];`
- [ ] Both of them, because they read the same elements

What counts is the **inner** loop. In the first loop, the inner index is `j`, the rightmost one, which changes fastest in memory. In the second, the inner index is `i`, so each read jumps a whole row.
:::

## Array of structures or structure of arrays?

Now back to the opening of this lecture. Suppose you keep many points, each with an `x`, a `y`, and a `z`. There are two ways to store them.

![Left: an array of structures, where memory holds x0 y0 z0 x1 y1 z1 x2 y2 z2, so the x values are spread apart. Right: a structure of arrays, where memory holds x0 x1 x2 x3 x4 x5 x6 x7 in a row, so all the x values are together.](../assets/figures/aos-soa.svg)

```c
/* Array of Structures (AoS) */
struct Point { int x, y, z; };
struct Point points[N];

/* Structure of Arrays (SoA) */
struct Points {
    int x[N];
    int y[N];
    int z[N];
};
```

- In an **array of structures**, each point's three values sit together. That is good when every operation needs `x`, `y`, and `z` of one point at once.
- In a **structure of arrays**, all the `x` values sit together, then all the `y` values, then all the `z` values. That is good when an operation scans just one of them, like summing `x`.

Count the lines. With 4-byte `int`s and 64-byte lines, an AoS line holds about 5 points, but a loop that reads only `x` uses just one third of the bytes it pulls in. The `y` and `z` bytes come along for nothing. In an SoA, a line holds 16 `x` values, and the loop uses all of them. That is the reason for the gap you saw at the start: AoS took 10.10 ms, and SoA took 3.62 ms. About three times faster, for a layout with one `x` in every three values.

**Choose the layout that matches the dominant access pattern.** If most of your loops use all three fields together, an array of structures is fine, and simpler. If the hot loop scans one field, a structure of arrays can win a lot.

:::check id=chk-aos-or-soa
A program has 10 million particles with many fields. Its busiest loop adds up only the `mass` of every particle. Which layout suits that loop best?

- [ ] An array of structures, because each particle stays together
- [x] A structure of arrays, so all the masses are next to each other
- [ ] It makes no difference, because the loop reads the same number of values

With a structure of arrays, the loop reads one array from start to end, and every byte in each cache line is a `mass`. With an array of structures, each line is mostly other fields that the loop never uses.
:::

## Matrix multiplication

Matrix multiplication is the classic example of a loop where order matters. To multiply `A` by `B`, each cell of the result `C` is a **dot product**: take one row of `A` and one column of `B`, multiply them cell by cell, and add the products. For example, with a 2 by 3 matrix `A` and a 3 by 2 matrix `B`:

```text
A = 1 2 3      B =  7  8      C = 58  64
    4 5 6           9 10          139 154
                   11 12
```

`C[0][1]` is row 0 of `A` times column 1 of `B`: 1×8 + 2×10 + 3×12 = 64.

The natural way to write this uses three loops, `i` over rows of `A`, `j` over columns of `B`, and `k` along the dot product. This order is called **i-j-k**:

```c
for (i = 0; i < N; ++i)
    for (j = 0; j < N; ++j) {
        double sum = 0;
        for (k = 0; k < N; ++k)
            sum += A[i][k] * B[k][j];
        C[i][j] = sum;
    }
```

Look at the inner loop, which changes `k`. `A[i][k]` walks along a row of `A`: stride 1, which is good. But `B[k][j]` walks **down a column** of `B`: stride `N`, which is bad.

![Two six by six grids for A and B. In A, one whole row is highlighted. In B, one whole column is highlighted. A code box shows the i-j-k loops, and a box lists a simplified cache model: A has one miss per 8 loads, B has about one miss per load, and combined about 56 percent of loads miss.](../assets/figures/matmul-ijk.svg)

A simplified cache model makes this concrete. Take row-major `double`s (8 bytes, so a 64-byte line holds 8), a very large `N`, an empty cache at the start, and no prefetching:

- `A`: 1 miss for every 8 loads, so 87.5% hits.
- `B`: about 1 miss for every load, so nearly 0% hits.
- Together: (1/8 + 1) / 2, about **56% of the loads miss**.

### Loop interchange: i-k-j

The fix is only to swap two loops. This version is **i-k-j**:

```c
for (i = 0; i < N; ++i)
    for (k = 0; k < N; ++k) {
        double aik = A[i][k];
        for (j = 0; j < N; ++j)
            C[i][j] += aik * B[k][j];
    }
```

It computes the same `C`. But now the inner loop changes `j`. `B[k][j]` and `C[i][j]` both walk along a **row**, stride 1. And `A[i][k]` does not change during the inner loop at all, so it is loaded once and reused `N` times.

![Grids for A, B, and C. A single cell of A is highlighted. A row of B and a row of C are highlighted. The labels say reuse A i k, and scan rows of B and C. The box says the steady state is roughly 94 percent hits for B and C accesses.](../assets/figures/matmul-ikj.svg)

In the same simplified model, the `B` row has 87.5% hits, and the `C` row stays hot. The `B` and `C` accesses reach roughly **94% hits**. Measured on a real machine, the last-level cache miss rate fell from **7.7% to 1.0%**, from this change alone.

:::trap
Forgetting that i-k-j **adds** into `C[i][j]`, so `C` must start at zero. The i-j-k version sets `C[i][j] = sum` once, so it does not care what was there before. The i-k-j version does `+=` many times, so first clear `C`.
:::

:::check id=chk-interchange
Why is i-k-j usually faster than i-j-k for large matrices?

- [ ] It does fewer multiplications
- [x] Its inner loop moves along rows of `B` and `C`, so each cache line is used fully
- [ ] It makes the matrices smaller

Both orders do the same N³ multiplications. The difference is only the order of the memory reads: i-k-j has stride 1 in the inner loop, and i-j-k jumps down a column of `B`.
:::

## Blocking keeps the working set in the cache

Loop interchange helps, but for very large matrices there is another problem. A row of `B` is long. By the time the loops return to it, other rows have pushed it out of the cache. The data a loop needs between one use of a line and the next is its **working set**. If the working set is bigger than the cache, you get **capacity misses**, and lines are thrown out before they are reused.

**Blocking**, also called **tiling**, cuts the work into small square pieces, **tiles**, of `BS` by `BS` elements, so that the working set of one piece fits in the cache.

![Two eight by eight grids. On the left, a long traversal colors a whole row and a whole column, which can exceed the cache. On the right, a blocked traversal colors only a small three by three tile that stays in the cache. A code box shows three loops over ii, kk, and jj stepping by BS.](../assets/figures/blocking.svg)

```c
for (ii = 0; ii < N; ii += BS)
    for (kk = 0; kk < N; kk += BS)
        for (jj = 0; jj < N; jj += BS)
            for (i = ii; i < ii + BS; ++i)
                for (k = kk; k < kk + BS; ++k) {
                    double aik = A[i][k];
                    for (j = jj; j < jj + BS; ++j)
                        C[i][j] += aik * B[k][j];
                }
```

The outer three loops pick a tile of `A`, a tile of `B`, and a tile of `C`. The inner three loops multiply just those tiles, which are small enough to stay in the cache while they are reused many times.

A tile spans several cache lines, but its working set stays in the cache for reuse. Here is a rough estimate for `BS = 32`:

- One tile of `double`s: 32 × 32 × 8 bytes = 8 KiB.
- Three active tiles (one each of `A`, `B`, and `C`): 24 KiB, which is 384 cache lines.
- That fits in a 32 KiB cache, so almost every access in the inner loops is a hit.

This is an idealized estimate. It assumes 64-byte lines, 32 KiB of usable cache, no conflict misses, and `N` divisible by `BS`. Real machines are messier, so in practice you try a few block sizes and measure.

:::check id=chk-tile-size
A tile is `BS × BS` doubles. With `BS = 16`, how many bytes are in one tile?

- [ ] 256
- [ ] 1,024
- [x] 2,048

16 × 16 = 256 doubles, and each is 8 bytes, so 256 × 8 = 2,048 bytes, which is 2 KiB. Three tiles are 6 KiB.
:::

## A checklist for analyzing a loop

When a loop is slower than you expect, walk through these six questions:

1. **Where are the bytes?** What does the layout in memory look like?
2. **Are the fields naturally aligned?** Is padding wasting space?
3. **How many cache lines are touched?** Count lines, not loads.
4. **Which misses can occur?** Cold, capacity, or conflict?
5. **Is the access pattern predictable?** Can the prefetcher follow it?
6. **Can loop order or layout improve locality?** Interchange, SoA, or blocking?

Efficient C begins with a concrete model of memory access.

## Practice

:::problem id=prac-loop-order title="Which order is friendlier?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
`double m[1000][1000];` is stored row by row, and a cache line holds 8 `double`s.

:::check id=prac-loop-order-q1
Walking along one row, `m[5][0]`, `m[5][1]`, `m[5][2]`, ..., the stride is {{=1 element|1000 elements|8 elements}}.

Neighbors in a row are neighbors in memory, so each step moves by one element.
:::

:::check id=prac-loop-order-q2
Walking down one column, `m[0][7]`, `m[1][7]`, `m[2][7]`, ..., the stride is {{=1000 elements|1 element|8 elements}}.

Each step skips a whole row of 1000 elements. So each read is 8,000 bytes from the last, which is a new cache line every time.
:::
:::

:::problem id=prac-matmul-model title="Counting misses in the model" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=source
Use the simplified model: row-major `double`s, 64-byte lines (8 doubles per line), a large `N`, a cold cache, and no prefetching.

:::check id=prac-matmul-model-q1
In i-j-k, the loads of `A[i][k]` along the inner loop miss once in every {{=8|1|64}} loads.

The inner loop walks along a row of `A`. One line holds 8 doubles, so only the first load of each line misses. That is 1 miss for every 8 loads.
:::

:::check id=prac-matmul-model-q2
In i-j-k, the loads of `B[k][j]` along the inner loop miss about {{=every time|once in 8 loads|never}}.

`B[k][j]` moves down a column, a whole row at a time, so each load is in a different line and nearly every load is a miss.
:::

:::check id=prac-matmul-model-q3
In i-k-j, the value `A[i][k]` is loaded {{=once and reused N times|N times|never}} in the inner loop.

It does not depend on `j`, so it is read once into `aik` and used for all `N` passes of the inner loop.
:::
:::

:::problem id=prac-tile-fit title="Does the tile fit?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=source
A tile is `BS × BS` doubles (8 bytes each). Blocked matrix multiplication keeps one tile of each of `A`, `B`, and `C` active at a time.

:::check id=prac-tile-fit-q1
With `BS = 16`, the three active tiles use {{=6 KiB|2 KiB|24 KiB}}.

One tile is 16 × 16 × 8 = 2,048 bytes, which is 2 KiB. Three tiles are 6 KiB, far below a 32 KiB cache.
:::

:::check id=prac-tile-fit-q2
With `BS = 32`, the three active tiles use {{=24 KiB|8 KiB|96 KiB}}.

One tile is 32 × 32 × 8 = 8,192 bytes, which is 8 KiB. Three tiles are 24 KiB, which still fits in a 32 KiB cache. That is 24 KiB / 64 B = 384 cache lines.
:::

:::check id=prac-tile-fit-q3
With `BS = 64`, the three active tiles use 96 KiB, which {{=does not fit|fits|fits with room to spare}} in a 32 KiB cache.

One tile is 64 × 64 × 8 = 32 KiB, so three tiles are 96 KiB. That is three times the cache, so the tiles would push each other out, with capacity misses. Choose a smaller block.
:::
:::

**Next:** [Functions that work with any type](topic:generic-functions) turns from speed to building: one function that handles any type of data, then a structure that carries its own function, and then your own small `malloc`.
