---
id: cache-mapping
title: Where a line goes in the cache
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

A cache is much smaller than main memory, so it cannot keep every line. When a new line arrives, the cache must decide **where** to put it, and later, when you ask for an address, it must find the line quickly. It does both with a simple trick: it reads the address as three pieces. This lesson shows the three pieces, works one address through by hand, and explains the three reasons a miss happens.

## An address has three parts

The cache cuts the bits of an address into three groups:

![One bar split into three colored parts, from left to right: Tag, Set index, and Block offset. The tag answers which memory block is here. The set index answers which cache set can hold it. The block offset answers which byte inside the line.](../assets/figures/address-split.svg)

| Part | Question it answers |
| --- | --- |
| **Block offset** | Which byte inside the line? |
| **Set index** | Which place in the cache may hold this line? |
| **Tag** | Which block of memory is stored there right now? |

The cache is divided into **sets**, and each set holds one or a few lines. The rule is: **each memory block maps to one specific set, and can be stored only in one of the lines of that set.**

The sizes of the parts come from the cache's design. With 64-byte lines, the block offset needs 6 bits, because 2⁶ = 64. With 16 sets, the set index needs 4 bits, because 2⁴ = 16. All the remaining bits at the left are the tag.

## A worked example

Assume the cache has **64-byte lines**, **16 sets**, and is **direct-mapped**, which means each set holds exactly one line. Take the address `0x12D0`, which is 4816 in ordinary numbers.

![The address 0x12D0 as 16 bits split into three parts: the tag 000100, the set index 1011, and the block offset 010000.](../assets/figures/address-example.svg)

You can find each part with division, without looking at bits:

- **Offset:** the position inside the line is the remainder after dividing by 64. 4816 mod 64 = **16**.
- **Set:** first find the line number, 4816 / 64 = 75, ignoring the remainder. Then take it modulo the number of sets: 75 mod 16 = **11**.
- **Tag:** divide by the size of one whole turn through the sets, 64 × 16 = 1024. 4816 / 1024 = **4**, ignoring the remainder.

So the cache looks in **set 11**, and compares the tag stored there with 4. If they match, it is a hit. If not, it is a miss: the line in set 11 is replaced by the one that has just arrived.

:::check id=chk-map-address
The same cache has 64-byte lines and 16 sets. For the address 2112 (`0x0840`), which set does it map to?

- [ ] Set 0
- [x] Set 1
- [ ] Set 33

2112 / 64 = 33, which is the line number. Then 33 mod 16 = 1, so the set is 1. Set 33 does not exist: there are only 16 sets, numbered 0 to 15.
:::

## Direct-mapped: one possible slot

In a **direct-mapped** cache, every set holds one line, so a memory block has exactly **one** place to go. Here is a tiny cache with 4 sets. Both address A and address B map to set 1:

![A cache with four sets, set 0 to set 3. Set 0, 2, and 3 are empty. Set 1 holds the line from address A. Address B also maps to set 1. A red note says both addresses map to set 1, so one evicts the other even when other sets are free.](../assets/figures/direct-mapped.svg)

If a program alternates between A and B, each one **evicts** (throws out) the other, even though the other sets are empty. Every access is a miss. These misses are caused by competition for one set.

For our cache, two addresses collide when they are a multiple of 64 × 16 = 1024 bytes apart, because then the line number differs by a multiple of 16. For example, addresses 0 and 1024 both map to set 0.

## Set-associative: several choices

A **set-associative** cache gives each set several lines, called **ways**. In a **2-way** cache, a set holds two lines. Now A and B can both live in set 1, side by side. The cache looks at both lines of the set to find the tag.

![A cache with four sets of two ways each. Set 1 holds address A in one way and address B in the other. A green note says each set has two ways: fewer conflicts, more lookup work.](../assets/figures/two-way.svg)

More ways mean fewer conflicts, but each lookup must compare more tags, which costs more work. Real caches are a compromise, such as 8 ways per set.

## Three kinds of misses

Not every miss has the same cause. The cause tells you what could fix it:

| Kind | What happened | What could help |
| --- | --- | --- |
| **Cold** (or compulsory) | The first time a block is used, it has never been loaded. | Nothing removes it, but fetching ahead (prefetching) hides it. |
| **Capacity** | The data the program needs is more than the cache can hold. | Work on smaller pieces at a time. |
| **Conflict** | Several lines compete for the same set, though the cache has room elsewhere. | More ways, or different addresses. |

:::check id=chk-miss-kinds
A program loops over 8 MB of data many times. The cache holds 32 KB. Most misses happen because the data does not fit. Which kind is it?

- [ ] Cold
- [x] Capacity
- [ ] Conflict

The cache cannot hold what the loop needs, so lines are thrown out before the loop comes back to them. Cold misses happen only the first time, and conflict misses need lines to compete for a set while room remains elsewhere.
:::

## Practice

:::problem id=prac-split-address title="Split an address" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
The cache has 64-byte lines and 16 sets, and is direct-mapped. Look at the address 3199, which is `0x0C7F`.

:::check id=prac-split-address-q1
The block offset is {{=63|3|49}}.

3199 mod 64 = 63, because 49 × 64 = 3136 and 3199 − 3136 = 63. It is the last byte of its line.
:::

:::check id=prac-split-address-q2
The set index is {{=1|49|15}}.

The line number is 3199 / 64 = 49, ignoring the remainder. Then 49 mod 16 = 1.
:::

:::check id=prac-split-address-q3
The tag is {{=3|1|49}}.

3199 / 1024 = 3, ignoring the remainder, because 3 × 1024 = 3072.
:::
:::

:::problem id=prac-conflict-pair title="Which pair collides?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
Same cache: 64-byte lines, 16 sets, direct-mapped.

:::check id=prac-conflict-pair-q1
Addresses 0 and {{=1024|512|64}} map to the same set.

Two addresses collide when they are a multiple of 64 × 16 = 1024 apart. 512 is set 8, and 64 is set 1, so they do not collide with set 0.
:::

:::check id=prac-conflict-pair-q2
A program alternates between two addresses that map to the same set, in a direct-mapped cache, forever. After the first two accesses, almost every access is a {{=conflict miss|cold miss|hit}}.

Each address throws the other one out of the single slot. Cold misses happen only on the first use, and a hit would need the line to still be there.
:::
:::

**Next:** [Locality and prefetching](topic:locality-and-prefetching) shows what kind of program makes the cache happy.
