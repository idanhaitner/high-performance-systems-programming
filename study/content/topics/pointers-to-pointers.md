---
id: pointers-to-pointers
title: Pointers to pointers
sources:
  - "Lecture 2 - Memory management.pptx"
---

Lecture 1 ended with pointers: variables that hold the address of another variable. Lecture 2 is about **managing memory yourself**, and almost every tool for that hands you a pointer. So this lesson starts with a short recap of pointers, then takes one step further: a pointer that holds the address of *another pointer*. That sounds like a puzzle, but it is just the same idea used twice.

## A quick recap: & and *

Remember the picture from [Memory and pointers](topic:memory-and-pointers): memory is a long street of numbered boxes, one byte per box. The number of a box is its **address**. A **pointer** is a variable whose value is an address.

```c
int x = 5;
int *px = &x;
printf("%d\n", *px);         /* 5 */
printf("%p\n", (void *)px);  /* an address, e.g. 0x7fffe1d2446c */
```

Line by line:

- `int x = 5;` makes a box for an `int` and puts 5 in it.
- `int *px = &x;` makes a second box, `px`, and stores the address of `x` in it. `&x` reads "the address of `x`".
- `*px` follows the address in `px` and reaches the box `x`, so it prints 5.
- `%p` prints an address. Addresses are printed in **hexadecimal** (base 16, written with `0x` in front), so you see something like `0x7fffe1d2446c`.

The star `*` has **two different jobs**, and this confuses almost everyone at first:

| Where the star appears | What it means | Example |
| --- | --- | --- |
| In a declaration (when you make a variable) | "this variable is a pointer" | `int *px;` |
| In an expression (when you use a variable) | "go to the address and take the value there" | `*px = 9;` |

And `&` always means "the address of".

:::check id=chk-star-two-jobs
After `int *a, b;`, what are the types of `a` and `b`?

- [x] `a` is a pointer to an `int`, and `b` is an `int`
- [ ] Both are pointers to `int`
- [ ] Both are `int`s, and the star only changes how `a` is read

The star belongs to the one name next to it, not to the whole line. To make two pointers, write `int *a, *b;`.
:::

## A pointer to a pointer

A pointer is a variable, so it lives in a box too, and that box has its own address. Nothing stops us from storing *that* address in yet another variable.

```c
int x = 10;
int *ptr = &x;
int **ptr_to_ptr = &ptr;
printf("x = %d\n", **ptr_to_ptr);  /* x = 10 */
```

Read the third line from the name outwards: `ptr_to_ptr` is a variable of type `int **`, "a pointer to a pointer to an `int`". Its value is `&ptr`, the address of the box `ptr`.

Let us give the boxes small, made-up addresses so we can follow them. (Real addresses are long hex numbers; small ones are easier to read.)

| Box | Lives at address | Holds |
| --- | --- | --- |
| `x` | 1020 | 10 |
| `ptr` | 1024 | 1020 (the address of `x`) |
| `ptr_to_ptr` | 1032 | 1024 (the address of `ptr`) |

An `int` takes 4 bytes, so `x` fills 1020 to 1023. On the 64-bit machines in this course every pointer takes 8 bytes, so `ptr` fills 1024 to 1031, and `ptr_to_ptr` starts at 1032.

![ptr_to_ptr holds the address of ptr, and ptr holds the address of x.](../assets/figures/pointer-to-pointer.svg)

Now follow the stars one at a time. Each star is one step along an arrow.

| You write | Steps | Value |
| --- | --- | --- |
| `ptr_to_ptr` | no step: the value in the box | 1024 |
| `*ptr_to_ptr` | one step: the box at 1024, which is `ptr` | 1020 |
| `**ptr_to_ptr` | two steps: the box at 1020, which is `x` | 10 |

So `**` is called a **double dereference**: follow the address once, then follow the address you find there.

:::definition id=def-pointer-to-pointer title="Pointer to pointer" source="Lecture 2 - Memory management.pptx"
A pointer to a pointer is a variable whose value is the address of another pointer. Its type has two stars, for example `int **`. One star (`*pp`) reaches the middle pointer; two stars (`**pp`) reach the final value.
:::

:::check id=chk-one-star place=text
Here are the three boxes from `int **ptr_to_ptr = &ptr;`:

| Box | Lives at | Holds |
| --- | --- | --- |
| `x` | 1020 | 10 |
| `ptr` | 1024 | 1020 |
| `ptr_to_ptr` | 1032 | 1024 |

What is `*ptr_to_ptr`?

- [x] 1020
- [ ] 1024
- [ ] 10

One star takes one step: from `ptr_to_ptr` to the box at 1024, which is `ptr`. The value in `ptr` is 1020, the address of `x`. You need a second star to reach the 10.
:::

## Changing the middle pointer

Here is why a pointer to a pointer is more than a trick. It does not hold a copy of an address; it points to the box `ptr` itself. So if `ptr` changes, `**ptr_to_ptr` follows the change.

```c
int x = 10;
int *ptr = &x;
int **ptr_to_ptr = &ptr;
printf("x = %d\n", **ptr_to_ptr);            /* x = 10 */

int y = 8;
ptr = &y;                                     /* ptr now points to y */
printf("**ptr_to_ptr = %d\n", **ptr_to_ptr);  /* **ptr_to_ptr = 8 */
```

We never touched `ptr_to_ptr`. It still holds the address of `ptr`. But `ptr` now holds the address of `y`, so following both arrows ends at `y`, which holds 8.

### Why you would want this: a function that changes your pointer

In Lecture 1's practice you wrote `swap`. A function receives **copies** of its arguments, so to change the caller's `int` it needs an `int *`. The same rule, one level up: to change the caller's **pointer**, a function needs a pointer to that pointer.

```c
/* Makes the caller's pointer point at the smaller of two ints. */
void point_at_smaller(int **pp, int *a, int *b) {
    if (*a < *b)
        *pp = a;   /* change the caller's pointer itself */
    else
        *pp = b;
}

int main(void) {
    int a = 7, b = 3;
    int *p = NULL;               /* NULL: points nowhere yet */
    point_at_smaller(&p, &a, &b);
    printf("%d\n", *p);          /* 3 */
    return 0;
}
```

- `main` passes `&p`, the address of its pointer `p`. Its type is `int **`.
- Inside the function, `*pp` *is* the caller's `p`. Writing `*pp = b;` makes `p` hold the address of `b`.
- Back in `main`, `*p` follows that address and prints 3.

You will use exactly this pattern later, when a function hands back memory it asked for.

:::check id=chk-change-callers-pointer place=text
The function is `void point_at_smaller(int **pp, int *a, int *b)`. `main` has its own pointer `p` and calls `point_at_smaller(&p, &a, &b);`.

Which line inside the function changes `p`?

- [x] `*pp = b;`
- [ ] `pp = b;`
- [ ] `**pp = *b;`

`pp` holds the address of `main`'s `p`, so `*pp` *is* `p`. `pp = b;` would only change the function's own copy, `pp`. `**pp = *b;` goes one step further, to the `int` that `p` points to, and changes that number instead of `p`.
:::

:::trap
Mixing up `*pp` and `**pp`. With `int **pp`, `*pp` is a pointer (an address), and `**pp` is the `int` at the end. Writing `*pp = 5;` tries to store the number 5 as an address, which the compiler rejects.
:::

## Practice

:::problem id=prac-double-deref title="Follow the arrows" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
A new set of boxes: `int n = 42;`, `int *p = &n;`, `int **q = &p;`. In this example `n` lives at 2000, `p` at 2008, and `q` at 2016.

:::check id=prac-double-deref-q1
`*q` is {{=2000|2008|42}}.

One star goes to the box at 2008, which is `p`. The value in `p` is the address of `n`: 2000.
:::

:::check id=prac-double-deref-q2
After `int m = 7; *q = &m; **q = 50;`, the values of `n` and `m` are {{=42 and 50|50 and 7|50 and 50}}.

`*q = &m` changes `p`, so `p` now points to `m`. Then two stars follow `q` to `p` and `p` to `m`, so the 50 goes into `m`. `n` was left behind.
:::

:::check id=prac-double-deref-q3
With the boxes as first set up, `&**q` is {{=2000|2008|42}}.

`**q` is the box `n`, and `&` asks for its address, which is 2000. It is the same as `*q`.
:::
:::

:::problem id=prac-move-middle title="Moving the middle pointer" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
```c
int x = 10, y = 8;
int *ptr = &x;
int **ptr_to_ptr = &ptr;
ptr = &y;
printf("%d\n", **ptr_to_ptr);
```

:::check id=prac-move-middle-q1
The program prints {{=8|10|the address of y}}.

`ptr_to_ptr` still points to `ptr`. After `ptr = &y;`, following both arrows reaches `y`, which holds 8.
:::

:::check id=prac-move-middle-q2
Which line would make `**ptr_to_ptr` reach `x` again, without writing `ptr` by name?

- [x] `*ptr_to_ptr = &x;`
- [ ] `**ptr_to_ptr = &x;`
- [ ] `ptr_to_ptr = &x;`

`*ptr_to_ptr` is the box `ptr`, so storing `&x` there makes `ptr` point to `x`. The second choice would put an address into an `int`; the third would make `ptr_to_ptr` skip the middle pointer, and its type would not match.
:::
:::

**Next:** [Pointer arithmetic and pointer mistakes](topic:pointer-arithmetic) moves pointers along an array, measures the distance between two pointers, and lists the pointer mistakes that crash programs.
