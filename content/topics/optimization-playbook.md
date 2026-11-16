---
id: optimization-playbook
title: "Putting it together: a playbook for faster code"
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
  - "ps4.pdf"
---

You now know many ways to make C faster: friendlier loop order from Lecture 3, and from this lecture, compiler options, fewer and easier branches, `restrict`, unrolling, and multiple accumulators. This last lesson is about **choosing**. It shows how to find which kind of problem a loop has, walks through one example in stages, adds a few lessons about how you ask for memory, and ends with a step-by-step plan you can use on any program.

## Where does the time go?

A slow loop is usually limited by one of four things. Each one has its own fixes:

| The loop is limited by | What happens | Fixes |
| --- | --- | --- |
| **Memory** | Cache misses: the processor waits for data from slower memory | Loop order, layout, blocking, one contiguous block |
| **Dependencies** | Each step waits for the result of the one before | Multiple accumulators, unrolling |
| **Control flow** | Branches that are often guessed wrong flush the pipeline | Predictable data, conditional values, tests moved out of loops |
| **What the compiler can prove** | The compiler plays safe because of possible aliasing or side effects | Local variables, `restrict`, calls moved out of loops |

A fix only helps if it targets the real limit. Four accumulators do nothing for a loop that spends its time waiting for cache misses. Sorting the data does nothing for a loop with no branch in it. So first find the limit, then pick the fix.

:::check id=chk-match-the-fix
A loop reads a huge table column by column, so almost every read is a cache miss. Which change is most likely to help?

- [ ] Using four accumulators
- [x] Swapping the loops so the inner loop reads along a row
- [ ] Rewriting an `if` inside it with `? :`

The loop is limited by memory. Reading along rows uses each cache line fully. The other two changes target dependencies and branches, which are not the problem here.
:::

## An example in stages

Here is a function that transforms an image-like table of `rows` by `cols` numbers, stored row by row:

```c
void transform(int rows, int cols, const float *src, float *dst) {
    for (int j = 0; j < cols; j++)
        for (int i = 0; i < rows; i++) {
            int p = i * cols + j;
            dst[p] = 3.0f * src[p] + 2.0f;
        }
}
```

Each output depends only on the same position of the input, so the order in which you visit the positions does not change the answer. A careful plan, one step at a time:

1. **Check what you may assume.** Are `src` and `dst` separate arrays? Here, yes. If they could overlap, some of the next changes would be wrong.
2. **Swap the loops**, so `i` is outside and `j` is inside. The inner loop then moves along a row with stride 1, instead of jumping a whole row each time. This is the memory fix, and for a large table it is usually the biggest win.
3. **Add `restrict`** to `src` and `dst`, since the arrays are separate. Now the compiler knows that writing `dst` cannot change `src`.
4. **Compare `-O2` and `-O3`.** The compiler may now unroll the loop by itself.
5. **Unroll by hand**, if measurements show it still helps.
6. **Measure again** on several table sizes, small ones that fit in the cache and big ones that do not.

After step 3, the function looks like this:

```c
void transform(int rows, int cols,
               const float * restrict src, float * restrict dst) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++) {
            int p = i * cols + j;
            dst[p] = 3.0f * src[p] + 2.0f;
        }
}
```

Note that the compiler may already do some of these steps. That is why you first measure a **baseline**, the original code built with the real build options, and compare every change against it.

## How you ask for memory matters

Say you need a million points:

```c
typedef struct { int x, y; } Point;
```

One way is an array of a million pointers, with a separate `malloc` for each point:

```c
Point *pts[1000000];
for (int i = 0; i < 1000000; i++)
    pts[i] = malloc(sizeof(Point));
```

(A real program would also check each result for `NULL`. And an array of a million pointers takes 8 MB, too much for the stack on many systems, so in practice `pts` itself would be on the heap too.)

This costs in three ways:

1. **Time.** A million calls to `malloc`, each of which must find a free place.
2. **Space.** Each block carries a few bytes of bookkeeping that `malloc` keeps for itself, often 8 to 16 bytes on a typical 64-bit Linux machine. On top of that, each point needs an 8-byte pointer. For an 8-byte point, that is more space for the extras than for the data.
3. **Cache.** The points can end up anywhere in the heap. Walking through them in order jumps around memory, so many reads are cache misses, and the processor cannot guess what comes next.

The other way is **one** block for all of them:

```c
Point *points = malloc(n * sizeof(*points));
if (points == NULL) {
    fprintf(stderr, "Allocation failed!\n");
    return 1;
}
points[i].x = 10;
points[i].y = 20;
```

![Left: an array of pointers p0 to p3, each pointing to a separate small x, y block placed at random spots in memory. Right: one pointer pts to a single block where the x, y pairs sit side by side. One malloc, no pointers to store, and the points share cache lines.](../assets/figures/scattered-vs-contiguous.svg)

One call, no pointers to store, and the points sit side by side, eight to a cache line. This is the same idea as in Lecture 3: data that is used together should sit together.

When objects come and go while the program runs, one fixed block may not fit. Two patterns help:

- A **memory pool** takes big pieces from `malloc` in advance and hands out fixed-size slots from them. Giving a slot back is fast, and the heap does not get cut into many small holes.
- An **arena**, like the [bump allocator](topic:bump-allocator), hands out pieces of one big block with a counter, and frees everything at once. It is ideal for many short-lived objects that all die together.

:::check id=chk-many-mallocs
A program keeps 1,000,000 small records, each made with its own `malloc` and reached through an array of pointers. Then it reads them all in order. Compared with one big block, which is NOT a cost of this design?

- [ ] A million calls to `malloc`
- [ ] Extra bytes for the pointers and for `malloc`'s bookkeeping
- [x] The records can no longer be changed after they are made

Records made with `malloc` can be changed freely. The real costs are the time of the many calls, the extra bytes, and the scattered records, which cause cache misses when read in order.
:::

## Bigger alignment is not a speed switch

GCC lets you ask for a bigger alignment than a type needs:

```c
typedef struct __attribute__((aligned(64))) {
    int counter;   /* 4 bytes */
} Counter;
```

Now every `Counter` starts on a 64-byte boundary, and `sizeof(Counter)` is **64**, not 4. The compiler adds 60 bytes of padding. An array of 1,000 counters takes 64 KB instead of 4 KB, which means 16 times as many cache lines for the same data.

This is useful in one special case. When two processor cores each keep changing their own variable, and the two variables happen to share a cache line, the cores keep taking the line away from each other. That is called **false sharing**, and you will meet it when programs use several cores. Giving each variable its own line stops it.

In a program that runs on one core, extra alignment only wastes cache. As always, measure before and after.

:::check id=chk-aligned-64
A structure holds one 4-byte `int` and is declared with `__attribute__((aligned(64)))`. What is its `sizeof`?

- [ ] 4
- [ ] 8
- [x] 64

The structure must start on a 64-byte boundary, and its size must be a multiple of its alignment so that each element of an array is aligned too. So 60 bytes of padding are added, for 64 in all.
:::

## The playbook

Here is a plan you can follow for any program:

1. **Define correct.** Keep the original output as a reference. Note the unusual cases, like empty input or a length that is not a multiple of 4. For floating-point results, decide on a tolerance.
2. **Measure the starting point.** Use realistic data, the real build options, and several runs.
3. **Find the limit.** Is it memory, dependencies, branches, or what the compiler can prove? Use a profiler.
4. **Choose one change.** Tie it to a reason: "the inner loop has stride `cols`, so swapping the loops should cut cache misses."
5. **Make the change and check it.** Watch for broken `restrict` promises, wrong tail loops, and undefined behavior.
6. **Measure again.** Several runs, the median, and the speedup against the starting point.
7. **Combine and test again.** Changes interact, so test on several input sizes.

Change one thing at a time. If you change three things and the program gets faster, you do not know which one helped, or whether one of them made it slower.

## The bigger picture

Hand optimization is the **last** step, not the first. The decisions that matter most come earlier:

1. Choose the features the program really needs.
2. Choose a good algorithm. No loop trick turns an `n × n` algorithm into a fast one when an `n` algorithm exists.
3. Choose data structures that suit how the data is used.
4. Choose a suitable programming language.
5. Write simple, clear code.
6. Then optimize, but only where a measurement shows it is needed.

## Practice

:::problem id=prac-name-the-limit title="Name the limit" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
For each loop, name what most likely limits its speed.

:::check id=prac-name-the-limit-q1
`for (i = 0; i < n; i++) sum += a[i];` over a small array of `double`s that fits in the cache is limited by {{=a dependency chain|cache misses|branch mispredictions}}.

The data is already in the cache, and the loop branch is easy to guess. Each addition waits for the last one, so the chain is the limit. Multiple accumulators help.
:::

:::check id=prac-name-the-limit-q2
`if (a[i] > t) count++;` over random data is limited by {{=branch mispredictions|a dependency chain|aliasing}}.

The test is true or false at random, so the processor often guesses wrong and flushes its pipeline.
:::

:::check id=prac-name-the-limit-q3
`for (j...) for (i...) out[i * cols + j] = in[i * cols + j];` over a huge table is limited by {{=cache misses|branch mispredictions|a dependency chain}}.

The inner loop changes `i`, so each read and write jumps a whole row. Each one lands in a different cache line.
:::
:::

:::problem id=prac-pointer-overhead title="The cost of many small blocks" source="ps4.pdf" kind=exercise solution_origin=derived
A program stores 1,000,000 points of 8 bytes each. Pointers are 8 bytes. Assume `malloc` keeps 8 bytes of bookkeeping per block.

:::check id=prac-pointer-overhead-q1
With one `malloc` per point, reached through an array of pointers, the program uses about {{=24 MB|8 MB|16 MB}}.

Each point costs 8 bytes of data, 8 bytes of bookkeeping, and an 8-byte pointer: 24 bytes, times a million.
:::

:::check id=prac-pointer-overhead-q2
With one block for all the points, it uses about {{=8 MB|24 MB|16 MB}}.

Just the data: 8 bytes times a million. The bookkeeping of one block is too small to count.
:::

:::check id=prac-pointer-overhead-q3
With one block, a 64-byte cache line holds {{=8|1|64}} points.

64 / 8 = 8 points per line, so reading them in order uses every byte that arrives.
:::
:::

**Next:** the practice for this lecture has coding exercises for each technique, and a lab where you time branches, accumulators, and compiler options on your own computer.
