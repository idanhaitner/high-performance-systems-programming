---
id: lecture-3
lecture: lecture-3
title: "Lecture 3 practice: memory layout, alignment, and the cache"
---

:::learn title="How this practice works"
You have read the lessons, so now you use them. Each lesson gets one new question and a very small code question where you write just a few lines, and most also get a bigger coding exercise. One lab, done on your own computer in VS Code (a free code editor), comes last. It ends with a final exercise that uses everything from these lessons.

Press **Next** when a step is done. If you are stuck, press **Skip for now**, or use the **Reread** link at the top of the step to open that step's lesson.

A coding exercise gives you the function's first line, and the panel on the left says what it must do. You write the rest on the right. **Run** shows what your code prints. **Submit** checks it against small test cases, and all of them must pass. Your code is tidied by itself each time you press either one. Pressing Ctrl+S (Cmd+S on a Mac) does the same as **Run**. The **Assembly** tab shows the machine instructions the compiler made; it is there if you are curious. If you get stuck, **Hints** opens one hint at a time, and **Solution** shows a finished answer. Try the exercise first, because you learn more that way. To move out of the editor with the keyboard, press Esc and then Tab.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press one of these buttons.
:::

:::check id=q-row-then-column lesson=memory-layout
`int a[2][3] = {{1, 2, 3}, {4, 5, 6}};` is stored in row-major order. What does this print?

```c
int *p = &a[0][0];
printf("%d %d\n", p[3], p[1]);
```

- [ ] `3 4`
- [x] `4 2`
- [ ] `2 4`

`p` walks through the table as one flat row: 1, 2, 3, 4, 5, 6. So `p[3]` is the fourth number, 4, which is the first number of row 1. And `p[1]` is the second number, 2.
:::

:::exercise ref=ex-flat-index lesson=memory-layout
:::

:::exercise ref=ex-column-sum lesson=memory-layout
:::

:::check id=q-which-is-padded lesson=alignment-and-padding
On a typical machine, `char` is 1 byte, `short` is 2, and `int` is 4. Which structure has the most padding?

- [ ] `struct { int a; short b; }`
- [x] `struct { char a; int b; short c; }`
- [ ] `struct { short a; short b; char c; }`

In the second one, `a` is followed by 3 padding bytes so that `b` can start at 4, and `c` is followed by 2 padding bytes at the end: 5 padding bytes in all, and the size is 12. The first one has 2 bytes of padding at the end (size 8), and the third has 1 (size 6).
:::

:::exercise ref=ex-round-up lesson=alignment-and-padding
:::

:::exercise ref=ex-reorder-fields lesson=alignment-and-padding
:::

:::check id=q-what-moves lesson=cache-lines
A program reads a single `char` that is not in any cache. How much data does the memory system move into the cache?

- [ ] 1 byte, the `char` itself
- [x] A whole cache line, typically 64 bytes
- [ ] The whole array the `char` belongs to

The cache works in lines, and the line that holds the `char` is copied in, with its neighbors. It does not know about arrays, and it does not copy less than a line.
:::

:::exercise ref=ex-lines-touched lesson=cache-lines
:::

:::check id=q-same-set lesson=cache-mapping
A direct-mapped cache has 64-byte lines and 16 sets. A program reads address 0, then address 1024, then address 0 again, and repeats this forever. What happens?

- [ ] After the first two reads, every read is a hit
- [x] Every read is a miss, because the two addresses use the same set
- [ ] Every read is a miss, because the cache is too small for two lines

The line number of address 1024 is 16, and 16 mod 16 is 0, the same set as address 0. They throw each other out, which is a conflict miss. The cache has 16 sets, so the problem is not its size: the other 15 sets are empty.
:::

:::exercise ref=ex-split-address lesson=cache-mapping
:::

:::check id=q-count-the-lines lesson=locality-and-prefetching
`int a[256];` starts at the beginning of a 64-byte cache line, and an `int` is 4 bytes. Loop A is `for (int i = 0; i < 256; i++) sum += a[i];`. Loop B is `for (int i = 0; i < 256; i += 16) sum += a[i];`, which reads 16 times fewer values. How do the numbers of cache lines they touch compare?

- [ ] Loop B touches 16 times fewer lines
- [x] They touch the same number of lines, 16 each
- [ ] Loop B touches half as many lines

Loop A reads all 256 numbers, which fill 16 lines. Loop B reads only `a[0]`, `a[16]`, `a[32]`, and so on, and each of those is 16 × 4 = 64 bytes after the last, so each one sits in a different line, and it also touches all 16 lines. Reading fewer values does not mean touching fewer lines.
:::

:::exercise ref=ex-sum-every lesson=locality-and-prefetching
:::

:::check id=q-which-layout lesson=efficient-c
A program stores a million `struct { float x, y, z, mass; }` and often computes only the sum of all the `mass` values. What is the best change?

- [ ] Put `mass` first in the structure
- [x] Keep the `mass` values in their own array
- [ ] Sort the points by `x`

A loop that reads only `mass` from an array of structures uses 4 bytes out of every 16, so three quarters of every cache line is wasted. In its own array, all the bytes in each line are masses. Moving `mass` to the front of the structure changes nothing, because the stride is still the size of the whole structure.
:::

:::exercise ref=ex-split-points lesson=efficient-c
:::

:::exercise ref=ex-matmul-ikj lesson=efficient-c
:::

:::lab ref=lab-cache-locality lesson=efficient-c
:::
