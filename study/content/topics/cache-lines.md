---
id: cache-lines
title: Cache lines and hits
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

A modern processor can do arithmetic far faster than main memory can supply numbers. If the processor had to wait for main memory every time it needed a value, it would spend most of its life waiting. The fix is to put small, fast memories between the processor and main memory. They are called **caches**. This lesson explains how a cache is organized, and what happens when the data you want is, or is not, in it.

## The memory hierarchy

The memories of a computer form a ladder. Near the processor, memory is tiny and very fast. Far from it, memory is huge and slow.

![A pyramid of five bars. At the top, the smallest bar is Registers. Below it come the L1 cache, the L2 cache, the L3 cache, and at the bottom the widest bar, Main memory. The top is labeled smaller and closer, and the bottom is labeled larger and farther.](../assets/figures/memory-hierarchy.svg)

- **Registers** are a few storage spots inside the processor itself. The processor computes on values that are in registers.
- **L1 cache** is the smallest and fastest cache, usually a few tens of kilobytes.
- **L2 cache** is bigger and a little slower.
- **L3 cache** is bigger again, and is often shared by all the cores of the chip.
- **Main memory** (RAM) holds your whole program. It is thousands of times bigger than L1, and much slower: an L1 answer arrives in a few processor steps, but main memory can take a couple of hundred.

The sizes and speeds change from chip to chip. What stays the same is the shape: the closer to the processor, the smaller and faster.

## A cache moves data in lines

When the processor asks for one byte that is not in the cache, the cache does not fetch just that byte. It fetches a whole block of neighboring bytes, called a **cache line**. On most machines today a line is **64 bytes**. That is 16 `int`s.

![Sixteen boxes numbered 0 to 15, representing 16 ints. Box 6 is highlighted as the value requested. The whole row is one 64-byte cache line.](../assets/figures/cache-line.svg)

So a request for one `int` also brings its 15 neighbors, because they share the same line. 64 bytes is common, not universal. What matters is the principle: **the unit of transfer is bigger than a single value.**

Lines also sit at fixed places. With 64-byte lines, line 0 holds addresses 0 to 63, line 1 holds addresses 64 to 127, and so on. To find the line of an address, divide by 64 and drop the remainder. Address 130 is in line 2, because 130 / 64 is 2 and some more.

:::check id=chk-line-of-address
With 64-byte cache lines, which line holds address 200?

- [ ] Line 2
- [x] Line 3
- [ ] Line 4

200 / 64 is 3 with a remainder of 8, so the address is in line 3, which covers addresses 192 to 255. Line 2 covers 128 to 191.
:::

## Hits and misses

When the processor needs a value, it checks the closest level first. If it is not there, it asks the next level, and so on, down to main memory.

![A chain of five boxes joined by lines: CPU, L1, L2, L3, and RAM. The CPU asks the closest level first.](../assets/figures/cache-path.svg)

- A **cache hit** happens when the line you need is already in the level being checked. It is fast.
- A **cache miss** happens when it is not there. The next level must supply the line. The extra waiting time is the **miss penalty**.

A miss at one level can still be a hit at the next one: an L1 miss that is found in L2 costs much less than a miss that goes all the way to main memory. When a line finally arrives, it is also copied into the closer levels, so the next request for it is a hit.

:::check id=chk-hit-or-miss
A program reads a value. It is not in L1, but it is in L2. What do we call this?

- [ ] A cache hit at every level
- [x] A miss in L1, and a hit in L2
- [ ] A miss in every level

L1 did not have the line, so it is a miss there. L2 did, so it is a hit there, and the program does not need to go to main memory.
:::

## A cache line is not the same as a load

Two different sizes are in play, and it is easy to mix them up:

| | Cache line | Load or store |
| --- | --- | --- |
| What it is | A block copied between levels of the memory hierarchy | One instruction that asks for one value |
| Typical size | 64 bytes | 1, 4, or 8 bytes |

When your code reads an `int`, that is a **load** of 4 bytes. If the line is not in L1, the **cache** brings in 64 bytes. The processor then takes its 4 bytes from the line.

## Aligned and split accesses

Even when the data is in the cache, alignment still matters. A value that starts on its natural boundary fits inside one cache line. A misaligned value can **straddle** two lines, so the processor has to read both.

![Top: an int at addresses 60 to 63 stays inside cache line 0, which covers 0 to 63. Bottom: an int at addresses 62 to 65 has two bytes in line 0 and two bytes in line 1, so a split access needs both lines.](../assets/figures/split-access.svg)

- An `int` at addresses 60 to 63 sits inside line 0. One line is enough.
- An `int` at addresses 62 to 65 has two bytes in line 0 and two in line 1. This is a **split access**, and it may need both lines.

A naturally aligned value never straddles a line, because the line size, 64, is a multiple of every alignment (1, 2, 4, 8). That is the second reason for padding: the extra bytes keep each value inside a single line, so the access stays cheap.

:::check id=chk-split-access
With 64-byte lines, which 4-byte `int` is a split access?

- [ ] An `int` at address 60
- [ ] An `int` at address 64
- [x] An `int` at address 62

An `int` at 62 fills addresses 62 to 65. Addresses 62 and 63 are in line 0, and 64 and 65 are in line 1. The `int` at 60 fills 60 to 63, all in line 0, and the one at 64 fills 64 to 67, all in line 1.
:::

:::trap
Thinking that reading 4 bytes moves only 4 bytes. The program asks for 4 bytes, but the memory system moves a whole 64-byte line. This is the key to the rest of the lecture.
:::

## Practice

:::problem id=prac-line-numbers title="Which line is it in?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
Cache lines are 64 bytes. Line 0 holds addresses 0 to 63.

:::check id=prac-line-numbers-q1
Address 130 is in line {{=2|1|3}}.

130 / 64 is 2 with a remainder of 2, so it is in line 2, which covers addresses 128 to 191.
:::

:::check id=prac-line-numbers-q2
An 8-byte `double` at address 120 fills addresses 120 to 127. It touches {{=1 line|2 lines|3 lines}}.

Line 1 covers addresses 64 to 127, so all 8 bytes are inside it. A `double` at a multiple of 8 never straddles a 64-byte line.
:::

:::check id=prac-line-numbers-q3
A 4-byte `int` at address 126 fills addresses 126 to 129. It uses {{=2 lines|1 line|3 lines}}.

Addresses 126 and 127 are in line 1, and 128 and 129 are in line 2, so the access is split across 2 lines.
:::
:::

**Next:** [Where a line goes in the cache](topic:cache-mapping) shows how an address picks its place in the cache.
