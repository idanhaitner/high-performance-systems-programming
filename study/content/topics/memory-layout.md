---
id: memory-layout
title: How C lays out data in memory
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

Here are two loops. Both add up exactly `N` values of `x`:

```c
/* Array of structures: each point keeps x, y, and z together */
for (size_t i = 0; i < N; ++i)
    sum += points[i].x;

/* Structure of arrays: all the x values sit in one array */
for (size_t i = 0; i < N; ++i)
    sum += x[i];
```

Same data, same number of additions, same loop. Yet in a demo in class, the first loop took **10.10 ms** and the second took **3.62 ms**. The numbers change from machine to machine, but the gap does not go away. The program did the same work. What changed is **where the bytes sit in memory** and **the order in which the program reads them**.

This lecture explains that gap. This first lesson is about the layout: where C puts arrays, structures, and tables of numbers. The next lessons explain why the layout matters to speed.

## Memory is a row of numbered bytes

You met this idea in [Memory and pointers](topic:memory-and-pointers). Memory is a long row of boxes, and each box holds one **byte**. Every byte has a number, its **address**. An address names exactly one byte, never a bigger piece.

A value bigger than a byte takes several boxes next to each other. An `int` is 4 bytes on a typical machine. If it starts at address 1000, it fills addresses 1000, 1001, 1002, and 1003. The next free box is 1004.

:::check id=chk-int-addresses
A 4-byte `int` starts at address 2000. Which addresses does it fill?

- [x] 2000, 2001, 2002, and 2003
- [ ] Only 2000, because an address names the whole value
- [ ] 2000 to 2004

Each address names one byte, and the `int` needs 4 bytes, so it fills four addresses in a row. The value is named by the address of its first byte, 2000. Address 2004 is the first byte after it.
:::

## Arrays are contiguous

An array is a row of elements of the same type with **no gaps** between them. The word for this is **contiguous**. With `int a[6];`, the elements `a[0]` to `a[5]` sit side by side, each one 4 bytes wide, so the whole array is 24 bytes.

That gives a simple rule. The address of element `i` is the start of the array plus `i` whole elements:

```c
&a[i] == a + i
```

In [Pointer arithmetic](topic:pointer-arithmetic) you saw that adding to a pointer counts elements, not bytes. The compiler multiplies by the size of one element, `sizeof(*a)`, for you. If `a` starts at address 1000, then:

| Element | Address |
| --- | --- |
| `a[0]` | 1000 |
| `a[1]` | 1004 |
| `a[2]` | 1008 |
| `a[3]` | 1012 |

:::check id=chk-array-address
`int a[6];` starts at address 1000, and an `int` is 4 bytes. At which address does `a[5]` start?

- [ ] 1005
- [ ] 1016
- [x] 1020

`a[5]` is 5 elements after `a[0]`, and each element is 4 bytes, so it starts 5 × 4 = 20 bytes after 1000, at 1020. The address 1005 would be right if the elements were single bytes.
:::

Because an array is one unbroken block, reading `a[0]`, then `a[1]`, then `a[2]` walks forward through memory one small step at a time. Remember that. The rest of the lecture is about how kind or unkind such walks are to the computer.

## Structures keep their fields in the order you wrote them

A structure also puts its members next to each other in memory, **in the order you declared them**. C never reorders them for you. Here is an array of points:

```c
typedef struct {
    int x, y, z;
} Point;

Point points[3];
```

Each `Point` is 12 bytes: `x`, then `y`, then `z`. The next point starts right after. So in `points`, the bytes go `x0 y0 z0 x1 y1 z1 x2 y2 z2`. The three `x` values are **not** side by side. They are 12 bytes apart, with a `y` and a `z` between them.

That is exactly why the first loop in this lesson was slower. It wanted only the `x` values, but they are spread out through memory, with unwanted bytes between them.

One more thing to know: the compiler is allowed to put empty bytes between members. The next lesson, [Alignment and padding](topic:alignment-and-padding), explains when and why. For `Point`, no empty bytes are needed, because every member is an `int`.

## A table of numbers is rows laid end to end

A table with rows and columns, such as `int a[3][4];`, has 3 rows of 4 numbers. But memory has no rows. It is a single row of bytes, so C has to flatten the table.

C stores it **row by row**: the whole of row 0, then the whole of row 1, then row 2. This order is called **row-major order**.

![A table of 3 rows and 4 columns stored as one line of 12 boxes. Row 0 comes first, then row 1, then row 2, and each row holds 4 boxes.](../assets/figures/row-major.svg)

Look at the order in the figure. Going along memory, the **rightmost index changes fastest**: `a[0][0]`, `a[0][1]`, `a[0][2]`, `a[0][3]`, and then the row number goes up. Neighbors in memory are neighbors in the same row.

The element `a[i][j]` is the `j`th element of the `i`th row. To reach it, skip `i` whole rows of 4 elements, and then `j` more:

```c
/* a is int a[3][4]: 4 columns */
&a[i][j] == (int *)a + (i * 4 + j)
```

In general, with `C` columns, the position of `a[i][j]` in the flat row is `i * C + j`. You can use this to store a table in a plain one-dimensional array and compute the position yourself. Programs that handle big tables often do exactly that.

:::check id=chk-next-in-memory
`int a[3][4];` is stored in row-major order. Which element is stored right after `a[1][3]`?

- [ ] `a[1][4]`
- [x] `a[2][0]`
- [ ] `a[0][3]`

`a[1][3]` is the last element of row 1. The next byte in memory belongs to the first element of row 2, `a[2][0]`. There is no `a[1][4]`, because the rows have only 4 elements, numbered 0 to 3.
:::

:::trap
Treating `a[i][j]` and `a[j][i]` as if they were equally close in memory. In `int a[3][4]`, the elements `a[0][0]` and `a[0][1]` are 4 bytes apart, but `a[0][0]` and `a[1][0]` are 16 bytes apart. Moving along a row is a small step, and moving down a column is a big jump.
:::

## Practice

:::problem id=prac-flat-index title="Where is the element?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
`int a[3][4];` starts at address 1000. An `int` is 4 bytes, and the table is stored in row-major order.

:::check id=prac-flat-index-q1
`a[1][2]` starts at address {{=1024|1012|1008}}.

Skip 1 whole row of 4 elements, then 2 more elements: that is 1 × 4 + 2 = 6 elements. 6 elements × 4 bytes = 24 bytes after 1000, which is 1024.
:::

:::check id=prac-flat-index-q2
`a[2][0]` starts at address {{=1032|1024|1008}}.

Skip 2 whole rows of 4 elements: 2 × 4 + 0 = 8 elements. 8 × 4 = 32 bytes after 1000, which is 1032.
:::

:::check id=prac-flat-index-q3
The element that starts at address 1020 is {{=a[1][1]|a[2][1]|a[1][0]}}.

1020 is 20 bytes after the start, which is element number 5 counting from 0. Row 1 holds elements 4 to 7, so element 5 is the second one in row 1, `a[1][1]`.
:::
:::

:::problem id=prac-struct-stride title="How far apart are the x values?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
`typedef struct { int x, y, z; } Point;` has 3 members of 4 bytes each, and no empty bytes. `Point points[100];` starts at address 5000.

:::check id=prac-struct-stride-q1
The `x` of `points[1]` starts at address {{=5012|5004|5001}}.

Each point is 12 bytes, so `points[1]` starts at 5000 + 12 = 5012, and its `x` is the first member.
:::

:::check id=prac-struct-stride-q2
Going from one `x` to the next, the distance is {{=12 bytes|4 bytes|1 byte}}.

Between two `x` values there is a whole `y` and a whole `z`, so the next `x` is one full `Point`, 12 bytes, further on.
:::
:::

**Next:** [Alignment and padding](topic:alignment-and-padding) explains the empty bytes that a structure can hide.
