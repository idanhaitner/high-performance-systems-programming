---
id: bump-allocator
title: "A bump allocator: writing your own malloc"
sources:
  - "ps3.pdf"
---

In [Memory on request: malloc and free](topic:malloc-and-free) you asked the system for memory and got back an address. It can feel like magic. This lesson removes the magic by writing a tiny version of `malloc` yourself. It is simple, it is fast, and it is used in real programs. Along the way you will use [alignment](topic:alignment-and-padding) to decide where each block may start.

## The idea: one big array and a counter

Imagine a long roll of paper tape. Each time someone asks for a piece, you cut it from the front of what is left, hand it over, and move the cutting mark forward. You never go back.

A **bump allocator** works the same way. At the start, the program sets aside one big array of bytes, called the **arena**. A counter says how many bytes have been handed out so far. A request takes the next piece of the arena and "bumps" the counter forward by its size.

```c
#include <stddef.h>

#define ARENA_SIZE 4096

static unsigned char arena[ARENA_SIZE];
static size_t next_offset = 0;
```

- `arena` is the array we hand out from. It holds 4096 bytes. An `unsigned char` is one byte, so the array is a row of raw bytes.
- `next_offset` counts bytes, and it is the position of the next free byte. At the start it is 0, because nothing was handed out yet.
- `static` means that these two variables live for the whole run of the program, and that only this file can see them.

![A row of boxes that stands for the arena. The first box is marked Block A, and it is followed by Block B. After them comes the free space. An arrow marked next_offset points at the first free byte.](../assets/figures/bump-arena.svg)

## The first version of `my_malloc`

The function receives the number of bytes wanted and returns the address of a piece that big. It does four things in order:

```c
void *my_malloc(size_t size) {
    if (size == 0 || size > ARENA_SIZE - next_offset)
        return NULL;                    /* 1. check there is room */
    void *ptr = &arena[next_offset];    /* 2. the piece starts here */
    next_offset += size;                /* 3. move the counter forward */
    return ptr;                         /* 4. give the address back */
}
```

Step by step:

1. **Check the room.** `ARENA_SIZE - next_offset` is how many bytes are still free. If the request is bigger, or is 0, the function returns `NULL`, which is the usual way for `malloc` to say "no".
2. **Find the address.** `&arena[next_offset]` is the address of the first free byte.
3. **Move the counter.** Adding `size` to `next_offset` marks those bytes as taken.
4. **Return the address.** The caller now owns `size` bytes that start there.

Let us follow three requests, starting from `next_offset = 0`:

```c
void *a = my_malloc(8);    /* a is arena + 0,  next_offset becomes 8 */
void *b = my_malloc(16);   /* b is arena + 8,  next_offset becomes 24 */
void *c = my_malloc(4);    /* c is arena + 24, next_offset becomes 28 */
```

Each piece starts exactly where the last one ended, with no gaps. The offsets 0, 8, and 24 are the start of each piece, counted from the start of the arena. To check it yourself, subtract the start of the array from an address: `(unsigned char *)b - arena` is 8.

:::check id=chk-bump-trace place=text
An allocator hands out memory from an empty array, so its counter `next_offset` starts at 0. A request for `n` bytes returns the next `n` bytes and adds `n` to the counter, with no padding. Two requests ask for 10 bytes and then 6 bytes. What is `next_offset` at the end?

- [x] 16
- [ ] 6
- [ ] 10

The first call hands out bytes 0 to 9 and moves the counter to 10. The second one starts at 10, uses 6 bytes, and moves the counter to 16.
:::

### Why the check is written that way

The room check is `size > ARENA_SIZE - next_offset`. You might write `next_offset + size > ARENA_SIZE`, which says the same thing in ordinary arithmetic. But a `size_t` cannot be negative, and a huge `size` added to `next_offset` can wrap around to a small number, and the check would pass by mistake. Subtracting first cannot go wrong, because `next_offset` is never bigger than `ARENA_SIZE`.

### When the arena is full

What if you ask for more than is left? Say `next_offset` is 28, and the code asks for 4069 bytes. Only 4096 − 28 = 4068 bytes are free, so the request is **one byte** too big.

The function returns `NULL` and changes **nothing**, so `next_offset` stays 28. The check happens before the counter moves, so a failed request does not use up any memory, and later requests can still succeed.

:::check id=chk-full place=text
`next_offset` is 28 in an arena of 4096 bytes. A call asks for 4069 bytes, and it fails. What is `next_offset` afterwards?

- [x] 28
- [ ] 4097
- [ ] 0

Failing must leave the arena as it was, so the counter stays at 28. The size check comes before the counter changes.
:::

## The problem: a block that starts in the wrong place

The first version has a flaw. Look at this:

```c
void *a = my_malloc(5);
void *b = my_malloc(sizeof(double));
```

`a` takes bytes 0 to 4, and `next_offset` becomes 5. So `b` starts at byte 5. But a `double` is 8 bytes, and in [alignment](topic:alignment-and-padding) you learned the rule: a value must start at an address that is a **multiple of its own size**, or of a number that the processor needs. Address 5 is not a multiple of 8.

A value at a misaligned address is slow on some processors, and on others it makes the program crash. In C, reading it that way is not allowed at all. An allocator must always give back an address that any ordinary value can use.

![A row of 16 numbered byte boxes. Bytes 0 to 4 are block A. Bytes 5 to 12 are block B, marked as misaligned because 5 is not a multiple of 8. Bytes 13 to 15 are free.](../assets/figures/bump-misaligned.svg)

## The fix: skip bytes until the offset lines up

If the next free byte is at a bad spot, skip a few bytes until you reach a good one. The skipped bytes are **padding**, empty bytes that nobody uses.

![Two rows of 16 byte boxes. The upper row shows block B starting at byte 5, which is misaligned. The lower row shows 3 padding bytes at 5 to 7, and block B starting at byte 8 instead.](../assets/figures/bump-padding.svg)

With a required alignment of 8, the padding is the distance from `next_offset` up to the next multiple of 8. To find it, use the **remainder** (what is left when you divide):

```c
size_t remainder = next_offset % ALIGNMENT;
size_t padding = remainder == 0 ? 0 : ALIGNMENT - remainder;
```

Take `next_offset = 5` and `ALIGNMENT = 8`:

1. `5 % 8` is 5, because 5 divided by 8 leaves 5.
2. Since the remainder is not 0, the padding is `8 - 5 = 3`.
3. The block can start at `5 + 3 = 8`, which is a multiple of 8.

If the offset is already a multiple, like 16, the remainder is 0 and the padding is 0. That is why the code tests for 0 first. Without the test, a remainder of 0 would give a padding of 8, and waste 8 bytes.

:::check id=chk-padding place=text
The alignment is 8, and `next_offset` is 21. How many padding bytes does the next block get?

- [x] 3
- [ ] 5
- [ ] 0

`21 % 8` is 5, because 16 is the biggest multiple of 8 below 21. The next multiple of 8 is 24, and 24 − 21 = 3.
:::

For the alignment itself, this site uses 8:

```c
#define ALIGNMENT 8
```

Every `int`, `double`, and pointer on a typical 64-bit machine needs an address that is a multiple of 8 or less, and a multiple of 8 is also a multiple of 4, 2, and 1. Real allocators use a number a little higher. C names the strictest requirement of any ordinary type: `_Alignof(max_align_t)`, which is 16 on a typical 64-bit Linux machine.

The arena must be lined up too. If the array itself started at a bad address, an offset that is a multiple of 8 would not give an address that is one. `_Alignas(max_align_t)` before the array asks the compiler to place it at a safe address:

```c
static _Alignas(max_align_t) unsigned char arena[ARENA_SIZE];
```

## The finished `my_malloc`

Now the function has one more step. It still must not change anything when it fails, so it checks that **the padding and the block** both fit, before it moves the counter:

```c
void *my_malloc(size_t size) {
    if (size == 0)
        return NULL;

    size_t remainder = next_offset % ALIGNMENT;
    size_t padding = remainder == 0 ? 0 : ALIGNMENT - remainder;
    if (padding > ARENA_SIZE - next_offset)
        return NULL;                         /* no room even for the padding */

    size_t aligned = next_offset + padding;  /* where the block will start */
    if (size > ARENA_SIZE - aligned)
        return NULL;                         /* no room for the block */

    void *ptr = &arena[aligned];
    next_offset = aligned + size;
    return ptr;
}
```

Check it with the two requests that failed before:

```c
void *a = my_malloc(5);
void *b = my_malloc(sizeof(double));
printf("%zu\n", (size_t)((unsigned char *)b - arena));   /* 8 */
printf("%zu\n", (size_t)b % ALIGNMENT);                  /* 0 */
```

`a` starts at 0 and uses bytes 0 to 4. The padding is 3 bytes, bytes 5 to 7, and `b` starts at 8. The second line prints the remainder of the address divided by 8, and it is 0, so `b` is aligned. The counter is now 16.

## What this allocator cannot do

It is simple, so it has real limits:

- **No `free` for one block.** There is nothing to give back a single piece. The counter only moves forward.
- **A fixed size.** The arena is 4096 bytes, and it cannot grow while the program runs.
- **No protection from several threads.** If two parts of a program run at the same time and both call it, they can corrupt the counter.
- **Only a basic alignment.** A type that needs a stricter alignment than `ALIGNMENT` would not be safe.

## Why use it anyway

It looks too weak to be useful, but it has two strengths:

- **It is very fast.** An allocation is a few additions. It does not search for a free spot as the system `malloc` must.
- **It frees everything at once.** Setting the counter back to 0 gives all the memory back in one step:

```c
void reset_arena(void) {
    next_offset = 0;
}
```

This is just as fast however many blocks there were. It is handy for data that all lives and dies together, such as the temporary pieces needed to draw one picture, or to read one file.

:::trap
Using a block after `reset_arena()`. The bytes are still there, but the next `my_malloc` will give them to someone else. Treat every address from the arena as dead the moment you reset.
:::

Choosing a way to allocate depends on how the data lives. If blocks live and die at different times, you need a real `malloc` and `free`. If a whole group of blocks is done at the same moment, an arena is a good fit.

:::check id=chk-after-reset place=text
An allocator hands out memory from an array, and its counter `next_offset` has just been reset to 0. Each block starts at the first multiple of 8 at or after the counter. Two requests ask for 5 bytes and then 8 bytes. At which offset does the second block start?

- [x] 8
- [ ] 5
- [ ] 13

After the reset, `next_offset` is 0, so the first block uses bytes 0 to 4. The counter is 5, which is not a multiple of 8, so 3 bytes of padding go in, and the second block starts at 8.
:::

## Practice

:::problem id=prac-bump-trace title="Follow the counter" source="ps3.pdf" kind=exercise solution_origin=derived
The arena has 4096 bytes and `next_offset` is 0. This version of `my_malloc` adds no padding.

:::check id=prac-bump-trace-q1
After `my_malloc(8)` and `my_malloc(16)`, the second block starts at offset {{=8|16|24}}.

The first block uses bytes 0 to 7, so the second begins at 8.
:::

:::check id=prac-bump-trace-q2
After `my_malloc(8)`, `my_malloc(16)`, and `my_malloc(4)`, `next_offset` is {{=28|24|32}}.

8 + 16 + 4 = 28. Each block starts right where the last one ended.
:::
:::

:::problem id=prac-bump-full title="Out of room" source="ps3.pdf" kind=exercise solution_origin=derived
The arena has 4096 bytes, and `next_offset` is 4090.

:::check id=prac-bump-full-q1
`my_malloc(6)` {{=succeeds and fills the arena|returns NULL|crashes}}.

There are 4096 − 4090 = 6 bytes left, and the request is for exactly 6, so it fits.
:::

:::check id=prac-bump-full-q2
`my_malloc(7)` returns NULL, and `next_offset` is then {{=4090|4097|4096}}.

A failed request changes nothing.
:::
:::

:::problem id=prac-bump-padding title="How much padding?" source="ps3.pdf" kind=exercise solution_origin=derived
The alignment is 8, and the padding is the distance up to the next multiple of 8.

:::check id=prac-bump-padding-q1
At `next_offset = 13`, the padding is {{=3|5|0}}.

`13 % 8` is 5, and 8 − 5 = 3. The next block starts at 16.
:::

:::check id=prac-bump-padding-q2
At `next_offset = 40`, the padding is {{=0|8|40}}.

40 is already a multiple of 8, so the remainder is 0, and no padding is needed.
:::
:::

**Next:** the practice for this lecture has coding exercises where you write `generic_swap`, a box that calls its own function, and a `my_malloc` of your own, before the final lab.
