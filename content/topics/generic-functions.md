---
id: generic-functions
title: Functions that work with any type
sources:
  - "ps3.pdf"
---

The last lessons were about speed: where data sits in memory, and how the order you read it in changes the time. The next three lessons are about **building your own tools** on top of memory. This first one makes a function that works on any type of data, so you do not have to write it again for every type. The next lesson puts that idea inside a structure, and the one after it builds a tiny version of `malloc`.

## The same job for every type

Swapping the values of two variables is the same job whether they hold whole numbers or decimals. Only the type changes:

```c
void swap_int(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void swap_double(double *a, double *b) {
    double temp = *a;
    *a = *b;
    *b = temp;
}
```

The two functions have the same steps. C checks types strictly, so `swap_int` will not accept a `double`. Writing one copy per type means a lot of repeated code, and every fix must be made in every copy.

Can one function do the job for all types? Yes, if it works on **bytes** and not on `int`s or `double`s. A byte is the smallest piece of memory that has an address, and every value in memory is made of bytes. If a function knows where a value starts and how many bytes it takes, it can swap it without caring what the value means.

That needs three tools. We will meet them one at a time: a pointer that has no type, a way to ask how many bytes a value takes, and a way to touch memory one byte at a time.

## A pointer with no type: `void *`

A pointer holds an address. A normal pointer such as `int *` also knows what it points at, so `*p` means "the `int` that starts there".

A `void *` is a pointer that holds only the address. It does not say what is stored there.

```c
int x = 10;
void *p = &x;       /* fine: p holds the address of x */
/* int y = *p; */   /* error: the compiler does not know how many bytes to read */
int y = *(int *)p;  /* fine: say what it points at first, then follow it */
```

Reading `*p` needs two facts: where to start, and how many bytes to read. A `void *` knows only the first. So C does not let you follow it directly.

To use the value, you first **cast** the pointer, which means telling the compiler to treat it as another type. `(int *)p` says "treat this address as the start of an `int`". Then the star follows it. Casting a pointer changes only how the compiler reads the address. It does not move or change the data.

:::definition id=def-void-pointer title="Generic pointer (void *)" source="ps3.pdf"
A `void *` holds an address without saying what type of value is stored there. You can pass it around and store it, but you must cast it to a pointer of the right type before you follow it.
:::

Why does this matter? A `void *` accepts the address of anything. One function with `void *` parameters can receive an `int`, a `double`, or a whole structure.

:::check id=chk-follow-void place=text
`void *p = &x;` where `x` is an `int`. Which line is allowed to read the value of `x` through `p`?

- [x] `int v = *(int *)p;`
- [ ] `int v = *p;`
- [ ] `int v = (int)p;`

`*p` is an error, because a `void *` does not say how many bytes to read. `(int)p` turns the **address** into a number, which is not the value of `x`. The first line casts the pointer first, and then follows it.
:::

## Telling the function how many bytes: `sizeof` and `size_t`

A function that gets a `void *` still needs to know how much memory to handle. The caller must say so, in bytes.

The `sizeof` operator gives the size in bytes of a type or a variable:

```c
int x = 10;
size_t n = sizeof(x);       /* 4 on a typical machine */
size_t m = sizeof(double);  /* 8 on a typical machine */
printf("%zu\n", n);
```

`size_t` is the type C uses for sizes and counts of bytes. It is a whole number that cannot be negative, which fits, because a size is never negative. To print one, use `%zu`.

`sizeof(x)` is better than writing 4 yourself. If `x` later becomes a `double`, `sizeof(x)` changes with it and the code stays right.

## Touching memory one byte at a time

A `char` is exactly one byte. So a pointer to `unsigned char` steps through memory one byte at a time. We use `unsigned char` and not plain `char` because plain `char` may be negative, and for raw memory we want plain values from 0 to 255. C also guarantees that you may look at the bytes of any value through an `unsigned char *`.

```c
int x = 42;
unsigned char *bytes = (unsigned char *)&x;
printf("%02X\n", bytes[0]);   /* the first byte of x, in hexadecimal */
```

`&x` is the address of the first byte of `x`. After the cast, `bytes[0]` is that first byte, `bytes[1]` is the next one, and so on up to `bytes[sizeof x - 1]`. The format `%02X` prints a number in hexadecimal (base 16) with at least two digits.

Here is something that surprises many people. Take a 4-byte `int` with the value `0x12345678`. The prefix `0x` means "written in hexadecimal". Each pair of hexadecimal digits is one byte, so the number has the four bytes `12`, `34`, `56`, and `78`. What order are they stored in?

```c
int x = 0x12345678;
unsigned char *bytes = (unsigned char *)&x;
for (size_t i = 0; i < sizeof x; i++)
    printf("%02X ", bytes[i]);
printf("\n");
```

On a typical computer this prints `78 56 34 12`. The **least significant** byte, the one that counts for the least, comes first in memory. This order is called **little-endian**. The other order, with `12` first, is called **big-endian**. The number itself does not change. Only the order of its bytes in memory does.

![Two rows of four boxes for the number 0x12345678. Little-endian memory holds 78, 56, 34, 12 from the lowest address up. Big-endian memory holds 12, 34, 56, 78.](../assets/figures/endian-bytes.svg)

Almost all desktop computers and phones today are little-endian, and the examples on this site assume that.

:::check id=chk-first-byte place=text
On a typical little-endian machine, `int x = 42;` is stored in 4 bytes, and `unsigned char *p = (unsigned char *)&x;`. What is `p[0]`?

- [x] 42, which is `0x2A`
- [ ] 0
- [ ] 4

42 fits in the lowest byte, and the lowest byte comes first in a little-endian machine. The other three bytes are 0. `p[0]` is not 4: 4 is the number of bytes, not the first one.
:::

## Writing `generic_swap`

Now we have everything. The function receives two addresses and the number of bytes to swap:

```c
void generic_swap(void *a, void *b, size_t size) {
    unsigned char *pa = a;
    unsigned char *pb = b;
    for (size_t i = 0; i < size; i++) {
        unsigned char temp = pa[i];
        pa[i] = pb[i];
        pb[i] = temp;
    }
}
```

Read it line by line:

1. `unsigned char *pa = a;` stores the address `a` in a pointer that steps one byte at a time. C allows this without a cast, because `void *` converts to any pointer type by itself.
2. The loop runs `size` times, once per byte.
3. Inside the loop, the three lines swap byte number `i` of the first value with byte number `i` of the second value, using `temp` as a free hand, just like `swap_int`.

When the loop ends, every byte has been swapped, so the two values have traded places. Here it is with 4 bytes, called A0 to A3 and B0 to B3:

| After step | First value | Second value |
| --- | --- | --- |
| start | A0 A1 A2 A3 | B0 B1 B2 B3 |
| `i = 0` | B0 A1 A2 A3 | A0 B1 B2 B3 |
| `i = 1` | B0 B1 A2 A3 | A0 A1 B2 B3 |
| `i = 3` (end) | B0 B1 B2 B3 | A0 A1 A2 A3 |

The same function now works for any type. Pass the address of each value, and the size of one of them:

```c
int a = 10, b = 20;
generic_swap(&a, &b, sizeof a);
printf("a=%d, b=%d\n", a, b);     /* a=20, b=10 */

double x = 1.5, y = 9.25;
generic_swap(&x, &y, sizeof x);
printf("x=%.2f, y=%.2f\n", x, y); /* x=9.25, y=1.50 */
```

:::check id=chk-swap-call place=text
`double x = 1.5, y = 9.25;` Which call swaps them?

- [x] `generic_swap(&x, &y, sizeof x);`
- [ ] `generic_swap(&x, &y, sizeof(int));`
- [ ] `generic_swap(x, y, sizeof x);`

The function needs the **addresses** of both values and the size of a `double`. `sizeof(int)` is 4 and swaps only the first 4 of the 8 bytes. Passing `x` and `y` themselves would hand over numbers, not addresses.
:::

## What a generic function gives up

Generic code is flexible, but it gets less help from the compiler.

- **No type checking.** The compiler cannot tell that you passed an `int` and a `double` together. `generic_swap(&a, &x, sizeof a)` compiles and mixes the bytes of two different types.
- **A wrong size is a silent bug.** If the size is too small, the swap is only partial. If it is too big, the function reads and writes **past the end** of the value, into whatever sits next to it.
- **The two values must be separate.** If they overlap in memory, swapping them byte by byte gives a wrong result.

:::trap
Passing the wrong size, such as `generic_swap(&x, &y, sizeof x + 1)`. The compiler does not complain, and the function overwrites a byte that is not yours. Always write `sizeof` of the variable itself, so the size cannot go out of date.
:::

The rule to keep: a generic function receives the **address** and the **size** of the data, and the caller is responsible for getting both right.

## Practice

:::problem id=prac-void-star title="What can a void pointer do?" source="ps3.pdf" kind=exercise solution_origin=derived
`int n = 7; void *p = &n;`

:::check id=prac-void-star-q1
To read the value 7 back through `p`, you write {{=*(int *)p|*p|(int)p}}.

A `void *` does not say how many bytes to read, so you first cast it to `int *` and then follow it.
:::

:::check id=prac-void-star-q2
`p + 1` is not allowed, because the compiler does not know {{=the size of the value|the address of the value|the name of the variable}}.

Moving a pointer by one step moves it by the size of what it points at. A `void *` does not say what that is.
:::
:::

:::problem id=prac-byte-order title="Which byte comes first?" source="ps3.pdf" kind=exercise solution_origin=derived
On a little-endian machine, `unsigned int v = 0x0A0B0C0D;` is stored as four bytes, and `unsigned char *p = (unsigned char *)&v;`.

:::check id=prac-byte-order-q1
`p[0]` is {{=0x0D|0x0A|0x0B}}.

The lowest byte of the number, `0D`, is stored first.
:::

:::check id=prac-byte-order-q2
`p[3]` is {{=0x0A|0x0D|0x0C}}.

The highest byte, `0A`, is stored last.
:::
:::

:::problem id=prac-swap-size title="The right size" source="ps3.pdf" kind=exercise solution_origin=derived
`generic_swap(void *a, void *b, size_t size)` swaps `size` bytes, starting at the two addresses. On a typical machine, `int` is 4 bytes and `double` is 8 bytes.

:::check id=prac-swap-size-q1
For `double p = 2.5, q = 7.5;`, the call that swaps them is `generic_swap(&p, &q, {{=sizeof p|sizeof(int)|1}});`.

The size must be the number of bytes in one `double`, which is `sizeof p`.
:::

:::check id=prac-swap-size-q2
Someone calls `generic_swap(&p, &q, 4);` on the same two `double`s. The result is that {{=only half of each double is swapped|nothing changes|the program does not compile}}.

4 of the 8 bytes trade places, so each variable ends up holding half of its own bytes and half of the other. The compiler cannot see the mistake.
:::
:::

**Next:** [Structures that hold any type](topic:generic-structures) keeps the address and the size together in one structure, and adds a function to it.
