---
id: alignment-and-padding
title: Alignment and padding
sources:
  - "Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf"
---

In [Structures](topic:structures) you saw that the size of a structure can be bigger than its members added up, because of empty bytes called **padding**. This lesson explains why those bytes exist, where the compiler puts them, how to ask the compiler about them, and how to choose the order of your members so that fewer bytes are wasted.

## Alignment: where a value may start

A value is **aligned to x** when its address is divisible by x. A 4-byte `int` that starts at address 4 is aligned to 4, because 4 mod 4 = 0. A 4-byte `int` that starts at address 6 is not, because 6 mod 4 = 2.

![Twelve boxes numbered 0 to 11. A 4-byte int fills boxes 4 to 7. Its starting address, 4, is divisible by 4, so it sits on a natural 4-byte boundary.](../assets/figures/alignment-boundary.svg)

Every type has a **natural alignment**: usually its own size. On a typical 64-bit machine:

| Type | Size | Starts at a multiple of |
| --- | --- | --- |
| `char` | 1 | 1 |
| `short` | 2 | 2 |
| `int`, `float` | 4 | 4 |
| `double`, pointers | 8 | 8 |

The exact numbers depend on the type and on the machine, so treat this table as typical, not as a law of C.

**Why does alignment exist?** The processor loads memory in chunks that start at nice round addresses. A value that starts on its natural boundary is fetched in one step. A value that straddles a boundary may need two steps, and some processors refuse a misaligned access altogether. So the compiler places every value on its boundary. The [next lesson](topic:cache-lines) shows a second reason that has to do with the cache.

## Padding between members

Because each member must start on its own boundary, the compiler adds unnamed empty bytes, **padding**, wherever a member would otherwise start at the wrong address. Compare these two layouts of `struct S { char c; int x; };`:

![Left: without padding, the char c is at offset 0 and the int x starts at offset 1, which is not divisible by 4. Right: with three padding bytes, x starts at offset 4.](../assets/figures/padding-between.svg)

`c` takes byte 0. The next free byte is 1, but `x` needs a multiple of 4, so bytes 1 to 3 become padding and `x` starts at byte 4. The usual result is `sizeof(struct S) == 8`, even though the members add up to only 5.

Here is a longer example with three members:

```c
struct Example {
    char  c;
    int   x;
    short s;
};
```

![The 12 bytes of struct Example. Offset 0 holds c, offsets 1 to 3 are padding, offsets 4 to 7 hold x, offsets 8 and 9 hold s, and offsets 10 and 11 are padding.](../assets/figures/padding-example.svg)

- `c` is at offset 0.
- Offsets 1 to 3 are padding, so that `x` can start at 4.
- `x` fills offsets 4 to 7.
- `s` fills offsets 8 and 9. A `short` needs a multiple of 2, and 8 is one.
- Offsets 10 and 11 are padding. The next section explains why.

The total is **12 bytes**, though the members add up to only 7.

:::check id=chk-padding-where
`struct { char a; double d; }`. A `double` is 8 bytes and starts at a multiple of 8. At which offset does `d` start?

- [ ] 1
- [x] 8
- [ ] 4

`a` takes byte 0. The next multiple of 8 is 8, so bytes 1 to 7 are padding and `d` starts at offset 8.
:::

## Padding at the end

The compiler also pads the **end** of a structure, so that its total size is a multiple of its biggest alignment. Why? Because of arrays. Look at this:

```c
struct T {
    int  x;
    char c;
};

struct T a[3];
```

The members use 5 bytes. If `sizeof(struct T)` were 5, then `a[1]` would start at 5, and its `x` would be misaligned. To keep `x` aligned in **every** element, the compiler rounds the size up to 8, adding 3 bytes of **tail padding**.

![An array of 3 structures of 8 bytes each. In each element, four bytes hold x, one byte holds c, and three bytes are tail padding. Every x starts at a multiple of 4.](../assets/figures/tail-padding.svg)

So `sizeof(struct T)` is 8, and every `x` in the array starts at a multiple of 4.

The alignment of a whole structure is the biggest alignment among its members. A structure with a `double` in it is aligned to 8, so its size is a multiple of 8.

## Asking the compiler

Do not guess the layout. Ask. C has three tools for this:

```c
#include <stddef.h>
#include <stdio.h>

struct Example {
    char  c;
    int   x;
    short s;
};

int main(void) {
    printf("size  = %zu\n", sizeof(struct Example));
    printf("align = %zu\n", _Alignof(struct Example));
    printf("x off = %zu\n", offsetof(struct Example, x));
    return 0;
}
```

A typical machine prints:

```text
size  = 12
align = 4
x off = 4
```

- `sizeof(type)` is the size in bytes, padding included.
- `_Alignof(type)` is the alignment of the type: the structure must start at a multiple of it.
- `offsetof(type, member)` is how many bytes from the start of the structure the member begins. It needs `<stddef.h>`.

`%zu` is the format for a `size_t`, the type these tools return.

## The order of the members changes the size

The compiler may not reorder your members, so **you** control how much padding there is. These two structures hold the same three members:

```c
struct A {          struct B {
    char c;             int  x;
    int  x;             char c;
    char d;             char d;
};                  };
```

- `struct A`: `c` at 0, padding at 1 to 3, `x` at 4 to 7, `d` at 8, and tail padding at 9 to 11. The size is **12**.
- `struct B`: `x` at 0 to 3, `c` at 4, `d` at 5, and tail padding at 6 and 7. The size is **8**.

Putting the small members together removes a lot of padding. A good rule of thumb is to list members from the biggest type to the smallest. In an array of a million of these, that is a saving of 4 MB, and less memory also means less to move through the cache.

:::check id=chk-field-order
Which structure is most likely the smallest, on a typical machine?

- [ ] `struct { char a; int b; char c; }`
- [x] `struct { int b; char a; char c; }`
- [ ] They are all the same size, because the members are the same

The members are the same, but the first structure needs padding after `a` so that `b` is aligned, and also tail padding. In the second one, the two `char`s sit together after `b`, so only 2 bytes of tail padding remain. The sizes are 12 and 8.
:::

:::trap
Adding up the member sizes to get the size of a structure. Use `sizeof`, and use `offsetof` when you want to know where a member starts.
:::

## Practice

:::problem id=prac-record-layout title="Predict the layout" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=source
Assume `char` is 1 byte, `int` is 4 bytes, and `double` is 8 bytes. Each member starts at a multiple of its own size, and the total size is a multiple of the biggest member. Here is the structure:

```c
struct Record {
    char   active;
    double value;
    int    id;
    char   type;
};
```

:::check id=prac-record-layout-q1
The member `value` starts at offset {{=8|1|4}}.

`active` is byte 0. A `double` must start at a multiple of 8, so bytes 1 to 7 are padding and `value` starts at 8.
:::

:::check id=prac-record-layout-q2
`sizeof(struct Record)` is {{=24|14|16}}.

`active` is at 0, `value` at 8 to 15, `id` at 16 to 19, and `type` at 20. That is 21 bytes, rounded up to a multiple of 8, which is 24. The last 3 bytes are tail padding.
:::

:::check id=prac-record-layout-q3
After putting the members in the order `value`, `id`, `active`, `type`, the size becomes {{=16|24|14}}.

`value` is at 0 to 7, `id` at 8 to 11, `active` at 12, and `type` at 13. That is 14 bytes, rounded up to a multiple of 8, which is 16.
:::
:::

:::problem id=prac-pad-sizes title="Padding or no padding?" source="Lecture 4 - Memory Layout, Alignment, Cache and Locality.pdf" kind=exercise solution_origin=derived
Use the same typical sizes: `char` 1, `short` 2, `int` 4, and the total rounded up to a multiple of the biggest member.

:::check id=prac-pad-sizes-q1
`struct { int a; int b; }` has size {{=8|9|12}}.

Both members are `int`s, so the second starts at 4 with no gap. The total, 8, is already a multiple of 4, so there is no padding.
:::

:::check id=prac-pad-sizes-q2
`struct { short s; char c; }` has size {{=4|3|2}}.

`s` is at 0 to 1 and `c` is at 2, which is 3 bytes. The biggest member is the `short`, so the total is rounded up to a multiple of 2, which is 4. One byte of tail padding remains.
:::

:::check id=prac-pad-sizes-q3
`struct { char a; char b; int c; }` has size {{=8|6|12}}.

`a` is at 0 and `b` is at 1. Bytes 2 and 3 are padding, so that `c` starts at 4. The total is 8, with no tail padding.
:::
:::

**Next:** [Cache lines and hits](topic:cache-lines) shows the second reason why placing data well matters: the memory system moves it in blocks.
