---
id: memory-and-pointers
title: Bytes, variables, and pointers
sources:
  - "Lecture 1 - Introduction.pdf"
---

A variable is easy to picture as "the number 5". In this course it is a cell: a value sitting at an address. Pointers, arrays, and later the process image are all ways of talking about those cells. An array (מערך) is the first structure whose performance depends on the cells being neighbors.

## RAM is an array of bytes

:::definition id=def-bit title="Bit" source="Lecture 1 - Introduction.pdf"
A bit is a binary digit. Its value is 0 or 1.
:::

:::definition id=def-byte title="Byte" source="Lecture 1 - Introduction.pdf"
A byte is a sequence of 8 bits. The most significant bit (MSB) is on the left and the least significant bit (LSB) is on the right.
:::

:::definition id=def-ram title="RAM as an addressable byte array" source="Lecture 1 - Introduction.pdf"
RAM is an array of bytes. The addresses run from 0 up to $2^n - 1$.
:::

![RAM is a byte array addressed from 0 through 2^n - 1, and one byte is eight bits with the MSB on the left.](../assets/figures/ram-byte.svg)

$n$ is the number of bits in an address on that machine. $n$ stays a parameter: the last legal address is $2^n - 1$, and every byte in between has its own address. Later chapters put code and data into this array.

:::check id=chk-byte
In a byte, which bit is on the left?

- [ ] The least significant bit
- [x] The most significant bit
- [ ] The sign bit of a C `int`, which is a different object

A byte is 8 bits numbered from 7 down to 0, and the high end is the MSB.
:::

## A variable is a place

:::definition id=def-object title="Value and address" source="Lecture 1 - Introduction.pdf"
Every object in memory has both a value and an address.
:::

The usual reading of `int x = 5;` is "x is 5". The memory reading is a row in a table:

| Address | Value | Name |
| --- | --- | --- |
| 0x7ffd1000 | ... | |
| 0x7ffd1004 | 5 | x |
| 0x7ffd1008 | ... | |

```c
printf("%d\n", x);  /* prints the value, 5 */
printf("%p\n", &x); /* prints the address, 0x7ffd1004 in this example */
```

`%d` prints the `int` value. `%p` prints an address. `&x` is the address of `x`. The numeric address is an example, so a run on your machine will show a different pointer. The pair (value, address) is the stable fact.

The first program uses four objects.

```c
#include <stdio.h>

int x = 10; /* global, explicitly initialized */
int y;      /* global, no initializer in the source */

int main() {
    int z = 5;                   /* local to main */
    int a[4] = {10, 20, 30, 40}; /* local array, four ints */

    printf("z = %d\n", z);
    return 0;
}
```

Globals are visible from any place in the program. Locals are visible inside the block where they are defined. `printf` is the usual way to produce output, and `return 0` is the usual way to leave `main`. Where the globals live, where the locals live, and how the array is laid out are answered in two steps. The array's layout is the next section. Which region of the process holds globals and locals is the chapter on [the running process](topic:source-to-process).

## A pointer stores an address

:::definition id=def-pointer title="Pointer" source="Lecture 1 - Introduction.pdf"
A pointer is a variable whose value is an address.
:::

```c
int x = 5;
int *p = &x;
```

Here `x` lives at `0x1000` and holds 5. `p` lives at `0x2000` and holds `0x1000`. So `p == &x`.

![p lives at 0x2000 and its value is 0x1000, the address of x.](../assets/figures/pointer-boxes.svg)

:::definition id=def-dereference title="Dereference" source="Lecture 1 - Introduction.pdf"
If `p` holds an address, then `*p` is the object stored at that address. An assignment `*p = ...` writes that object.
:::

These four names are different objects:

| Expression | What it is |
| --- | --- |
| `x` | the value stored in `x` |
| `&x` | the address of `x` |
| `p` | the address stored in `p` |
| `*p` | the value at the address stored in `p` |

```c
*p = 100;
printf("%d\n", x);   /* 100 */
printf("%d\n", *p);  /* 100 */
```

The assignment writes through the address. `x` and `*p` name the same cell after `p = &x`, so both prints show 100.

:::problem id=worked-dereference title="Write 100 through a pointer" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Start from `int x = 5; int *p = &x;`. After `*p = 100`, what do `x` and `*p` print, and why are they the same?

:::solution
Both print 100. `p` holds `&x`, so `*p` is the cell `x`. The assignment stores 100 in that cell. Printing `x` and printing `*p` read the same cell.
:::
:::

:::trap
Printing `p` when you meant `*p`, or storing into `p` when you meant `*p`. `p = 100` would replace the address. `*p = 100` replaces the `int` at that address. The check is the four names: value of `x`, address of `x`, address in `p`, value at that address.
:::

## Arrays are contiguous

:::definition id=def-contiguous title="Contiguous array" source="Lecture 1 - Introduction.pdf"
The elements of an array are stored one after another in memory. That contiguous layout (רצף של אלמנטים, a run of elements) is what makes a memory-access pattern meaningful for performance.
:::

```c
int a[4] = {10, 20, 30, 40};
```

| Address | Value | Element |
| --- | --- | --- |
| 0x1000 | 10 | a[0] |
| 0x1004 | 20 | a[1] |
| 0x1008 | 30 | a[2] |
| 0x100C | 40 | a[3] |

The step is 4 because these elements are `int`, and an `int` occupies 4 bytes. `&a[0]`, `&a[1]`, and `&a[2]` print three addresses with that spacing.

:::algorithm id=alg-pointer-add title="Pointer arithmetic" source="Lecture 1 - Introduction.pdf" complexity="O(1) address arithmetic per addition" invariant="If p points at an element of type T, then p + k points k elements further on, which is k * sizeof(T) bytes past p."
```text
int a[4] = {10, 20, 30, 40};
int *p = a;     /* p holds the address of a[0] */

p               /* 0x1000 */
p + 1           /* 0x1004 */
p + 2           /* 0x1008 */
```
`p + 1` means: advance by `sizeof(*p)` bytes.
:::

The name of the array, used as a pointer, is the address of the first element. Adding an integer scales by the element size. Adding 1 to an `int *` adds 4 bytes on this model, which is why `0x1000` becomes `0x1004` and the hex digit goes `0, 4, 8, C`.

![Four ints at 0x1000, 0x1004, 0x1008, and 0x100C. Adding 1 to the pointer advances one element.](../assets/figures/array-layout.svg)

:::theorem id=thm-index title="Index and offset are the same cell" source="Lecture 1 - Introduction.pdf"
For an array `a` and an index `i` inside it, `a[i]` and `*(a + i)` designate the same element.

:::proof
**Intuition.** An index counts elements. Pointer addition counts the same elements and then dereferences.

**Proof.** `a` used in `a + i` is the address of `a[0]`. By the rule for pointer addition, `a + i` advances `i * sizeof(*a)` bytes, which is the address of the element `i` places after the first. The subscript `a[i]` is defined to be that element. Dereferencing the advanced pointer reads the same element. Both `a[2]` and `*(a + 2)` are the cell at `0x1008`, whose value is 30.

**What the proof used.** Contiguous placement of the elements, and the rule that pointer addition scales by `sizeof(*p)`.
:::
:::

:::problem id=worked-index-equivalence title="a[2] and *(a + 2)" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
For `int a[4] = {10, 20, 30, 40}` starting at `0x1000`, give the address and the value named by `a[2]` and by `*(a + 2)`.

:::solution
Both name the element two `int`s past the start. The address is `0x1008`. The value is 30.
:::
:::

:::trap
Adding 1 to an `int *` as if it added 1 byte. The step is `sizeof(*p)` bytes. For an `int` that is 4, so the address goes from `0x1000` to `0x1004`, and the bytes in between belong to `a[0]`.
:::

## Practice

:::problem id=prac-value-and-address title="Value, address, and dereference" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`int x = 5;` and `int *p = &x;`. `x` is at `0x1000` and `p` is at `0x2000`.

:::check id=prac-value-and-address-q1
`p == &x` is {{=true|false|true only after *p = 100}}.

`p` was initialized with `&x`, so the address stored in `p` is the address of `x`.
:::

:::check id=prac-value-and-address-q2
After `*p = 100`, the value of `x` is {{=100|5|0x1000}}.

`*p` is the cell `x`. The assignment writes 100 there.
:::

:::check id=prac-value-and-address-q3
Match the expression to the reading of `p`.

- [x] `p` is the address stored in `p`, which is `0x1000`
- [ ] `p` is the address of the pointer variable, which is `0x1000`
- [ ] `p` is the `int` value 5

The pointer variable itself lives at `0x2000`. The value inside it is `0x1000`, the address of `x`.
:::
:::

:::problem id=prac-pointer-step title="How far p + 1 moves" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`int a[4] = {10, 20, 30, 40};` and `int *p = a;`, with `a[0]` at `0x1000`. An `int` is 4 bytes.

:::check id=prac-pointer-step-q1
`p + 1` evaluates to {{=0x1004|0x1001|0x1008}}.

The addend is scaled by `sizeof(*p)`, which is 4.
:::

:::check id=prac-pointer-step-q2
`p + 2` evaluates to {{=0x1008|0x1002|0x100C}}.

Two elements past `0x1000` is `0x1000 + 8`.
:::

:::check id=prac-pointer-step-q3
The scale factor in `p + k` is

- [x] `sizeof(*p)`, the size of the type `p` points at
- [ ] Always 1 byte, regardless of type
- [ ] The number of elements in the array

`p + 1` advances by `sizeof(*p)` bytes.
:::
:::

:::problem id=prac-array-formula title="The subscript formula" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-array-formula-q1
The equivalence is {{=a[i] == *(a + i)|a[i] == *a + i|a[i] == &(a + i)}}.

The subscript is a dereference of the pointer that has been advanced by `i` elements.
:::

:::check id=prac-array-formula-q2
For the array `{10, 20, 30, 40}`, `*(a + 2)` is {{=30|20|0x1008}}.

`a + 2` is the address `0x1008`. The star reads the `int` stored there, which is 30. The address itself would be `&a[2]` or `a + 2`, without the star.
:::
:::

:::problem id=prac-first-program-roles title="Globals and locals in the first program" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use the program with global `x` and `y`, and local `z` and `a[4]` inside `main`.

:::check id=prac-first-program-roles-q1
Which objects are global?

- [x] `x` and `y`
- [ ] `z` and `a`
- [ ] Only `x`, because `y` has no initializer

Both `x` and `y` are declared outside `main`. The initializer changes where the bytes are filled in, which the process chapter takes up. It does not change the "global" label.
:::

:::check id=prac-first-program-roles-q2
`printf("z = %d\n", z)` prints {{=5|10|the address of z}}.

`z` was initialized to 5, and `%d` prints that `int`.
:::

:::check id=prac-first-program-roles-q3
The elements of `a` are stored

- [x] One after another, `a[0]` then `a[1]` then `a[2]` then `a[3]`
- [ ] In four separate allocations whose gap is chosen by `printf`
- [ ] On four different RAM chips, one element each

Contiguous storage is the definition of an array layout.
:::
:::

The addresses in this chapter are the raw material of a process. [From source to a running process](topic:source-to-process) places globals, locals, and code into regions of that address space. [Data types and sizeof](topic:c-data-types) fixes the widths that pointer arithmetic multiplies by.
