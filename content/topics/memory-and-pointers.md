---
id: memory-and-pointers
title: Memory and pointers
sources:
  - "Lecture 1 - Introduction.pdf"
  - "ps1 (1).pdf"
---

In the last lesson, `scanf` needed `&x`, "the address of `x`". This lesson explains what that means. We picture memory as a long street of numbered boxes, see that every variable lives in one of those boxes, and meet **pointers**: variables that hold a box number. Then we look at **arrays**, which are many boxes in a row. Pointers are the idea most beginners find hardest in C, so we go slowly.

## Memory is a long row of numbered boxes

:::definition id=def-bit title="Bit" source="Lecture 1 - Introduction.pdf"
A bit is the smallest piece of information: a single 0 or 1.
:::

:::definition id=def-byte title="Byte" source="Lecture 1 - Introduction.pdf"
A byte is 8 bits. It is the smallest piece of memory that has its own address. In diagrams, the most important (highest-value) bit is drawn on the left.
:::

Imagine memory as a very long street. Each house is one byte, and each house has a number. That number is the byte's **address**.

:::definition id=def-ram title="Address" source="Lecture 1 - Introduction.pdf"
An address is the number of one byte in memory. The bytes are numbered 0, 1, 2, 3, and so on. Not every number is a usable address: a program may only use the parts of memory the operating system has given it.
:::

![A byte contains eight bits, with the most significant bit drawn on the left.](../assets/figures/ram-byte.svg)

Addresses are usually written in **hexadecimal** (base 16), with a `0x` in front: `0x1000` is just the number 4096. Hex is used because each hex digit is exactly 4 bits, so it is a compact way to write binary.

Two small notes for later: on the 64-bit machines in this course, an address is 8 bytes long. And the addresses your program sees are not the physical positions on the memory chip; the operating system translates them. For now, just think of them as house numbers.

:::check id=chk-byte place=text
A byte holds the bits `10000001`, with the bit worth the most on the left. As a number with no sign, what is its value?

- [x] 129
- [ ] 3
- [ ] 65

The left bit is worth 128 and the right bit is worth 1, so the value is 129. Each bit is worth twice the one on its right.
:::

## Every variable has a value and an address

When you write `int x = 5;`, the computer picks 4 bytes somewhere in memory for `x` and stores 5 there. So `x` has two things:

- its **value**: 5
- its **address**: the number of its first byte, for example `0x1000`

:::definition id=def-object title="Value and address" source="Lecture 1 - Introduction.pdf"
A variable has a value. If it is stored in memory, it also has an address: the address of its first byte. (If a program never asks for a variable's address, the compiler may keep it inside the processor instead of memory.)
:::

You can print both:

```c
int x = 5;
printf("%d\n", x);          /* the value: 5 */
printf("%p\n", (void *)&x); /* the address, e.g. 0x7ffd5c3a1b2c */
```

`&x` means "the address of `x`". The placeholder `%p` prints an address. (The `(void *)` in front is a technicality: `%p` wants a general "address of anything", so we convert to it.) The address will be different each time you run the program, because the operating system places things at random positions for security.

### Where a variable lives and how long it exists

Look at this program:

```c
#include <stdio.h>

int x = 10; /* outside any function: a global variable */
int y;      /* global, and no starting value given, so it starts at 0 */

int main(void) {
    int z = 5;                   /* inside main: a local variable */
    int a[4] = {10, 20, 30, 40}; /* local: four ints in a row */
    printf("z = %d\n", z);
    return 0;
}
```

Variables differ in three ways:

- **Where the name can be used (scope).** `x` and `y` are written outside any function, so any code below them in the file can use them. `z` and `a` are written inside `main`, so only code inside `main` can use them.
- **Whether other files can see it (linkage).** A big program is split into several `.c` files. Another file can use the global `x` by writing `extern int x;`. If you write `static int x = 10;` instead, `x` becomes private to this file.
- **How long it exists (lifetime).** Globals `x` and `y` exist for the entire run of the program. A global with no starting value, like `y`, starts at 0. Locals `z` and `a` are created when `main` starts and destroyed when it ends, so their addresses are only valid while `main` is running.

## Pointers: a variable that holds an address

:::definition id=def-pointer title="Pointer" source="Lecture 1 - Introduction.pdf"
A pointer is a variable whose value is an address. It also has a type, which says what kind of value lives at that address. A pointer can also be `NULL`, meaning it points nowhere.
:::

```c
int x = 5;
int *p = &x;
```

Read the second line as: "make a variable `p` of type `int *` (a pointer to an `int`), and store the address of `x` in it."

So now there are two boxes. Say `x` lives at `0x1000` and holds 5. `p` lives somewhere else, say `0x2000`, and holds `0x1000`. In other words, `p` holds the house number of `x`. We say "`p` **points to** `x`".

Two small facts about pointers:

- **Every address on one machine has the same size**, whatever it points to: 8 bytes on a 64-bit machine, 4 bytes on an old 32-bit one. The type (`int *`, `char *`) only says how to read the bytes at that address.
- **When you declare several pointers on one line, each name needs its own star.** `int *p1, *p2, *p3;` makes three pointers. But `int* p1, p2;` makes one pointer `p1` and one plain `int` `p2`, because the star belongs to the name, not to the type. That is why most C code writes the star next to the name.

![The pointer object p stores the address of x.](../assets/figures/pointer-boxes.svg)

### Following a pointer: the star

If `p` holds an address, `*p` means "the box at that address". Following a pointer like this is called **dereferencing** it.

:::definition id=def-dereference title="Dereference" source="Lecture 1 - Introduction.pdf"
If `p` points to a variable, `*p` *is* that variable. You can read it or assign to it. Using `*p` when `p` is `NULL`, or does not point to a real variable, is undefined behavior (usually a crash).
:::

| You write | It means | In our example |
| --- | --- | --- |
| `x` | the value in `x` | 5 |
| `&x` | the address of `x` | `0x1000` |
| `p` | the value in `p`, which is an address | `0x1000` |
| `*p` | the box `p` points to, that is, `x` | 5 |

Now change `x` through the pointer:

```c
*p = 100;           /* go to the box p points to, and store 100 there */
printf("%d\n", x);  /* 100 */
printf("%d\n", *p); /* 100 */
```

We never wrote `x = 100`, yet `x` changed. That is because `*p` and `x` are the **same box**. This is exactly how `scanf("%d", &x)` fills in your variable: you give it the address, and it writes through it.

A common mistake is writing `p = 100` (without the star). That tries to change the pointer itself, to point at address 100, and C refuses it as an error. Even if forced, it would not change `x`.

:::trap
Writing `p = 100` to change `x`. Without the star you are changing the pointer, not the box it points to. To change `x` through `p`, write `*p = 100`.
:::

## Arrays: boxes side by side

:::definition id=def-contiguous title="Array" source="Lecture 1 - Introduction.pdf"
An array is a list of values of the same type, stored **contiguously**: one right after another in memory, with no gaps.
:::

```c
int a[4] = {10, 20, 30, 40};
```

This makes four `int`s in a row. You reach them with an **index** in square brackets, counting from 0: `a[0]` is 10, `a[1]` is 20, and so on. Since each `int` is 4 bytes, if `a[0]` starts at `0x1000`:

| Address | Value | Element |
| --- | --- | --- |
| 0x1000 | 10 | a[0] |
| 0x1004 | 20 | a[1] |
| 0x1008 | 30 | a[2] |
| 0x100C | 40 | a[3] |

(`0x100C` is `0x1008 + 4`; in hex, after 9 come A, B, C, D, E, F.)

![Four int elements at addresses four bytes apart.](../assets/figures/array-layout.svg)

### Adding to a pointer moves by whole elements

When you use the array's name `a` in an expression, C treats it as a pointer to the first element, `&a[0]`. (Two exceptions: inside `sizeof` and after `&`.)

```c
int *p = a;  /* p holds 0x1000, the address of a[0] */
/* p + 1 is 0x1004  (a[1]) */
/* p + 2 is 0x1008  (a[2]) */
```

Notice: `p + 1` is `0x1004`, not `0x1001`. When you add a number to a pointer, C counts in **elements**, not bytes. Because `p` points to `int`s, which are 4 bytes each, `p + 1` moves 4 bytes. In general, `p + k` moves `k * sizeof(*p)` bytes.

So the same `++` moves a different distance for each pointer type (sizes on the course's 64-bit Linux machines):

| Pointer | Starts at | After `p++` | Moved by |
| --- | --- | --- | --- |
| `char *p` | 1000 | 1001 | `sizeof(char)` = 1 |
| `short *p` | 2000 | 2002 | `sizeof(short)` = 2 |
| `int *p` | 3000 | 3004 | `sizeof(int)` = 4 |
| `long *p` | 4000 | 4008 | `sizeof(long)` = 8 |

You can use `+`, `-`, `++`, and `--` on pointers.

You may only move within the array, or to the spot just one past its end (useful as an "end" marker, but you must not read from it).

### What a[i] really means

:::definition id=def-subscript title="Subscript" source="Lecture 1 - Introduction.pdf"
In C, `a[i]` is defined to mean `*(a + i)`: start at the beginning, move `i` elements forward, and take the value there.
:::

So `a[2]` and `*(a + 2)` are the same thing: the box at `0x1008`, holding 30.

**C does not check the index.** Writing `a[4]` or `a[-1]` compiles fine, but it reads memory outside the array, which is undefined behavior. Also, when you pass an array to a function, the function only receives a pointer to the first element. It does not know how long the array is, so you must pass the length as a separate argument.

### Strings are arrays of characters

A **string** (text) in C is an array of `char` that ends with a special character `'\0'`, whose code is 0. So `"hi"` is stored as three bytes: `'h'`, `'i'`, `'\0'`. Functions like `printf("%s", ...)` know where the text ends only by finding that 0. (Don't confuse it with the digit `'0'`, whose code is 48.)

:::trap
Thinking `p + 1` moves one byte. For an `int *`, it moves one whole `int`: 4 bytes. The bytes `0x1001` to `0x1003` are just the rest of `a[0]`.
:::

## Practice

:::problem id=prac-value-and-address title="Value, address, and dereference" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new pair: `int n = 7;` and `int *q = &n;`. In this example, `n` lives at `0x3000` and `q` lives at `0x3008`.

:::check id=prac-value-and-address-q1
`&q` is {{=0x3008|0x3000|7}}.

`q` holds `0x3000`, but `&q` asks where `q` itself lives, which is `0x3008`.
:::

:::check id=prac-value-and-address-q2
After `int m = *q; m = 9;`, the value of `n` is {{=7|9|0x3000}}.

`int m = *q;` copies the value 7 into a new box. Changing `m` does not touch `n`.
:::

:::check id=prac-value-and-address-q3
After `q = q + 1;` (no star), `q` holds {{=0x3004|0x3001|0x3008}}, and `n` is still 7.

Adding 1 to an `int *` moves one `int`, which is 4 bytes. The value in `n` is untouched, because no star was used.
:::
:::

:::problem id=prac-pointer-step title="How far d + 1 moves" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A different array: `double d[3] = {1.5, 4.5, 8.5};`, with `d[0]` at `0x2000`. Each `double` is 8 bytes.

:::check id=prac-pointer-step-q1
`d + 2` is {{=0x2010|0x2016|0x2002}}.

Two `double`s is 16 bytes. 16 in hex is `0x10`, so `0x2000 + 0x10 = 0x2010`.
:::

:::check id=prac-pointer-step-q2
`*d + 2` is {{=3.5|8.5|0x2010}}.

The star comes first: `*d` is `d[0]`, which is 1.5. Then 2 is added. To reach `d[2]` you need the parentheses: `*(d + 2)`.
:::

:::check id=prac-pointer-step-q3
`*(d + 3)` is {{=a read past the end of the array, so anything can happen|0.0, because the missing element reads as zero|a compile error, because d has only 3 elements}}.

`d + 3` is the spot just after the array. C does not check it, and the compiler usually accepts it. Reading there is undefined behavior.
:::
:::

:::problem id=prac-array-formula title="The subscript formula" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-array-formula-q1
C defines `a[i]` as `*(a + i)`, and `a + 2` is the same as `2 + a`. So `2[a]` is {{=the same element as a[2]|a compile error|the address of a[2]}}.

It looks wrong, but it follows from the formula: `2[a]` means `*(2 + a)`, which is `*(a + 2)`. No one should write it, but it shows that `[]` is only short for adding and following.
:::

:::check id=prac-array-formula-q2
For `int a[4] = {10, 20, 30, 40}`, what is `*(a + 1) + 1`? {{=21|30|11}}

Inside the parentheses, `a + 1` moves to `a[1]`, and the star takes its value, 20. The last `+ 1` adds to that value, not to the address.
:::
:::

:::problem id=prac-first-program-roles title="Scope and lifetime in a new program" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
```c
int total;              /* written outside any function */

void add(int n) {
    int doubled = n * 2;
    total = total + doubled;
}

int main(void) {
    add(3);
    add(4);
    printf("%d\n", total);
    return 0;
}
```

:::check id=prac-first-program-roles-q1
If the `printf` line moves to before `add(3);`, the program prints {{=0|garbage|14}}.

No `add` has run yet, and a global with no starting value starts at 0. Only locals start with garbage.
:::

:::check id=prac-first-program-roles-q2
As written, how many separate boxes named `doubled` are made during the run? {{=2|1|0}}

`doubled` is local to `add`. A new one is made on each call and destroyed when that call returns, and `add` is called twice.
:::
:::

**Next:** [Printing and reading values](topic:printf-and-scanf) uses what you now know about addresses and strings to look closely at `printf` and `scanf`.
