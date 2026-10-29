---
id: pointer-arithmetic
title: Pointer arithmetic and pointer mistakes
sources:
  - "Lecture 2 - Memory management.pptx"
---

In the last lesson a pointer pointed at one variable. Most of the time, though, a pointer points into an **array**: many values of the same type, side by side in memory. This lesson shows how to walk through an array with a pointer, how to measure the distance between two pointers, and why `sizeof` gives different answers for an array and a pointer. It ends with the pointer mistakes that crash programs, and the habit that prevents most of them.

## Four ways to name the same element

Take a small array and a pointer to its start:

```c
int A[4] = {1, 2, 3, 4};
int *p = A;   /* p holds the address of A[0] */
```

As you saw in [Memory and pointers](topic:memory-and-pointers), when you use the name `A` in an expression, C treats it as the address of the first element. So `p = A` is the same as `p = &A[0]`.

Say the array starts at address 1000. Each `int` is 4 bytes, so the elements sit at 1000, 1004, 1008, and 1012.

| Element | Address | Value |
| --- | --- | --- |
| `A[0]` | 1000 | 1 |
| `A[1]` | 1004 | 2 |
| `A[2]` | 1008 | 3 |
| `A[3]` | 1012 | 4 |

Adding a number to a pointer moves it by whole **elements**, not bytes. `p + 1` is 1004, the next `int`. This is called **pointer arithmetic**.

Because `A[i]` is defined as `*(A + i)`, there are four ways to write the same address and four ways to write the same value:

| All of these mean | For `i = 1` |
| --- | --- |
| the **address** of element `i`: `A + i`, `&A[i]`, `p + i`, `&p[i]` | 1004 |
| the **value** of element `i`: `*(A + i)`, `A[i]`, `*(p + i)`, `p[i]` | 2 |

So you may use square brackets on a pointer (`p[1]`), and a star with an array name (`*(A + 1)`). They are the same thing written two ways.

:::definition id=def-pointer-arithmetic title="Pointer arithmetic" source="Lecture 2 - Memory management.pptx"
Adding a whole number `k` to a pointer moves it `k` elements forward, which is `k * sizeof(element)` bytes. The result is only valid while it stays inside the array, or exactly one step past its last element.
:::

:::check id=chk-pointer-plus-three
`A` starts at address 1000 and holds `int`s, 4 bytes each, and `p = A`.

Which address is `p + 3`?

- [ ] 1003
- [x] 1012
- [ ] 1004

Adding 3 moves the pointer three **elements**, not three bytes: 3 × 4 = 12 bytes, so 1000 + 12 = 1012. That is the address of `A[3]`.
:::

## Subtracting two pointers

You can also subtract one pointer from another, when both point into the same array. The answer is **how many elements apart** they are, not how many bytes.

```c
int a[] = {10, 20, 30, 40, 50, 60};
int *p1 = a;       /* points to a[0] */
int *p2 = a + 5;   /* points to a[5] */
printf("%td elements\n", p2 - p1);   /* 5 elements */
```

- `p2 - p1` is 5, because `a[5]` is five elements after `a[0]`.
- The result has a special type, `ptrdiff_t`, a whole-number type big enough to hold any distance. Its `printf` placeholder is `%td`.

What if you want the distance in **bytes**? Make C see the two addresses as addresses of single bytes. A `char` is exactly 1 byte, so we **cast** (convert) both pointers to `char *`:

```c
printf("%td bytes\n", (char *)p2 - (char *)p1);   /* 20 bytes */
```

`(char *)p2` means "the same address, but treat it as pointing to a `char`". Now one step is one byte, so the distance is 5 elements × 4 bytes = 20.

:::trap
Writing `*p2 - *p1` for the distance. The stars take the **values**: `60 - 10` is 50, which has nothing to do with where the elements are. To compare positions, subtract the pointers themselves: `p2 - p1`.
:::

:::check id=chk-pointer-distance
```c
int a[] = {10, 20, 30, 40, 50, 60};
int *p1 = &a[1];
int *p2 = &a[4];
```

What is `p2 - p1`?

- [x] 3
- [ ] 12
- [ ] 30

`a[4]` is three elements after `a[1]`, so the answer is 3. The distance in bytes would be 12, and `*p2 - *p1` (the values) would be 50 − 20 = 30.
:::

## sizeof: an array is not a pointer

`sizeof` tells you how many bytes something takes. Look at what it says for arrays and for pointers:

```c
int A[] = {1, 2, 3};
int *pi = A;
char B[] = {1, 2, 3};
char *pc = B;

printf("%zu ", sizeof(A));    /* 12: three ints, 4 bytes each */
printf("%zu ", sizeof(pi));   /* 8: one address */
printf("%zu ", sizeof(B));    /* 3: three chars, 1 byte each */
printf("%zu\n", sizeof(pc));  /* 8: one address */
```

(`%zu` is the placeholder for a `sizeof` result.)

- `sizeof(A)` is the size of the **whole array**: 3 × 4 = 12 bytes.
- `sizeof(pi)` is the size of **one address**. On the 64-bit machines in this course that is 8 bytes, no matter what the pointer points to. So `sizeof(pc)` is also 8.

So even though `A` *behaves* like a pointer in most expressions, it is not one. `sizeof` is one of the two places where an array keeps its full size (the other is `&A`). This is also why a function that receives an array cannot use `sizeof` to find its length: the function only gets a pointer, and `sizeof` of a pointer is always 8.

:::check id=chk-sizeof-pointer
On a 64-bit machine, what is `sizeof(p)` for `double *p;`?

- [ ] 4
- [x] 8
- [ ] It depends on how many `double`s `p` points to

Every pointer on a 64-bit machine is an 8-byte address. The type it points to does not change the size of the address itself.
:::

## Mistakes the compiler catches

A pointer's type says what kind of value lives at the address. C checks that the types fit, and refuses code like this:

```c
int x = 4;
int *px;
px = x;     /* wrong: x is a number, not an address */
```

```c
int *px;
float *pf;
pf = px;    /* wrong: an int box is not a float box */
```

- `px = x` tries to put the *value* 4 into a pointer. You meant `px = &x`.
- `pf = px` tries to treat the address of an `int` as the address of a `float`. The bytes of an `int` mean something completely different when read as a `float`.

Most current compilers stop with an error on both lines. Some older ones only print a **warning**: a message that says "this looks wrong" but still builds the program. Treat these warnings as errors and fix them.

## Mistakes the compiler does not catch

These compile without complaint, and fail only when the program runs.

### A pointer that was never given an address

```c
int *px;   /* no starting value */
*px = 9;   /* writes 9 to... where? */
```

A local variable with no starting value holds whatever bytes were left in its box: **garbage**. So `px` holds some random address, and `*px = 9` writes 9 there. That is undefined behavior: the C rules do not say what happens. It might crash, or it might quietly overwrite some other variable.

### The NULL pointer

`NULL` is a special pointer value that means "points nowhere". Its address is 0, and programs are never allowed to read or write there. If you try, the operating system stops your program with a **segmentation fault** (often shown as "Segmentation fault" or "segfault").

:::definition id=def-segfault title="Segmentation fault" source="Lecture 2 - Memory management.pptx"
A segmentation fault is a crash the operating system causes when a program touches memory it may not use, for example address 0 (`NULL`), or memory that was never given to the program.
:::

That sounds bad, but a crash at `NULL` is the *good* outcome: it stops at the bug instead of quietly corrupting data. So the habit is:

1. Give every pointer a starting value. If you have no address yet, use `NULL`.
2. Before you follow a pointer that might be `NULL`, check it.

```c
int *px = NULL;
/* ... later, px may or may not get a real address ... */
if (px != NULL)
    *px = 9;
```

Note that the check only helps if you started with `NULL`. A garbage pointer is not `NULL`, so `if (px != NULL)` would let it through.

:::trap
Declaring `int *px;` and checking `if (px != NULL)` later. An uninitialized pointer holds garbage, not `NULL`, so the check passes and `*px` still writes to a random place. Write `int *px = NULL;` when you declare it.
:::

:::check id=chk-null-write
```c
int *p = NULL;
*p = 1;
```

What happens?

- [ ] The compiler refuses to build it
- [x] It builds, and the program crashes with a segmentation fault when it runs
- [ ] It writes 1 at address 0 and keeps going

The compiler does not check where a pointer points while the program runs, so this builds. Address 0 is never yours, so the operating system stops the program at the second line with a segmentation fault.
:::

## Practice

:::problem id=prac-float-step title="Stepping through a float array" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
```c
float A[5] = {12.5, 10.0, 13.5, 90.5, 0.5};
float *ptr1 = &A[0];
float *ptr2 = ptr1 + 3;
printf("%.1f ", *ptr2);
printf("%td\n", ptr2 - ptr1);
```

:::check id=prac-float-step-q1
The first number printed is {{=90.5|13.5|0.5}}.

`ptr1 + 3` moves three `float`s forward, to `A[3]`, which holds 90.5.
:::

:::check id=prac-float-step-q2
The second number printed is {{=3|12|90}}.

Pointer subtraction counts elements, not bytes. The pointers are 3 elements apart. (They are 12 bytes apart, because a `float` is 4 bytes, but `ptr2 - ptr1` does not count bytes.)
:::
:::

:::problem id=prac-sizeof-array-pointer title="sizeof of arrays and pointers" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
On a 64-bit machine:

```c
int A[] = {1, 2, 3};
int *pi = A;
char B[] = {1, 2, 3};
char *pc = B;
```

:::check id=prac-sizeof-array-pointer-q1
`sizeof(A)` is {{=12|3|8}}.

`A` is a whole array of three `int`s, and each `int` is 4 bytes.
:::

:::check id=prac-sizeof-array-pointer-q2
`sizeof(pc)` is {{=8|1|3}}.

`pc` is a pointer. It holds one address, and an address is 8 bytes on a 64-bit machine. That the address points to `char`s does not matter.
:::

:::check id=prac-sizeof-array-pointer-q3
`sizeof(B)` is {{=3|8|12}}.

`B` is an array of three `char`s, and each `char` is 1 byte.
:::
:::

:::problem id=prac-count-between title="Elements and bytes between two pointers" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
```c
int a[] = {10, 20, 30, 40, 50, 60};
int *p1 = a;
int *p2 = a + 5;
```

:::check id=prac-count-between-q1
The number of **elements** between `p1` and `p2` is {{=p2 - p1|*p2 - *p1|(char *)p2 - (char *)p1}}.

Subtracting two `int *` pointers counts `int`s: the answer is 5.
:::

:::check id=prac-count-between-q2
The number of **bytes** between `p1` and `p2` is {{=(char *)p2 - (char *)p1|p2 - p1|*p2 - *p1}}.

Seen as `char *`, each step is 1 byte, so the difference is 5 × 4 = 20. `*p2 - *p1` subtracts the values 60 and 10, which tells you nothing about positions.
:::
:::

:::problem id=prac-which-crash title="Which line is a bug?" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
:::check id=prac-which-crash-q1
Which code is safe?

- [ ] `int *p; *p = 1;`
- [ ] `int *p = NULL; *p = 1;`
- [x] `int n; int *p = &n; *p = 1;`

The first writes through a garbage address. The second writes to address 0, which crashes with a segmentation fault. Only the third points `p` at a real box (`n`) before writing.
:::

:::check id=prac-which-crash-q2
Which line does the compiler reject (or at least warn about)?

- [x] `int x = 4; int *px = x;`
- [ ] `int x = 4; int *px = &x;`
- [ ] `int *px = NULL;`

`x` is a number, not an address, so it does not fit in an `int *`. The other two give the pointer a real address or `NULL`.
:::
:::

**Next:** [Pointers to functions](topic:function-pointers) shows that functions live in memory too, so a pointer can hold the address of a function, and you can pass that pointer around like any other value.
