---
id: function-pointers
title: Pointers to functions
sources:
  - "Lecture 2 - Memory management.pptx"
---

So far every pointer held the address of a **value**: an `int`, a `float`, another pointer. This lesson shows that a **function** has an address too, and that a pointer can hold it. With such a pointer you can choose *which* function to run while the program is running, pass a function to another function, and keep several functions in an array. It builds on the previous lesson's pointers, and on `typedef` from [Structures](topic:structures).

## A function lives in memory too

A function is a list of machine instructions. In [Programs and processes](topic:source-to-process) you saw that those instructions sit in the `.text` part of the running program's memory. So, like any value in memory, a function starts at some address.

The name of a function, used without parentheses, stands for that address. Think of the function as a recipe in a cookbook: the name is the page number where the recipe starts.

:::definition id=def-function-pointer title="Function pointer" source="Lecture 2 - Memory management.pptx"
A function pointer is a variable that holds the address of a function. Calling through the pointer runs that function. Its type says what the function receives and what it returns.
:::

## Making and using a function pointer

```c
#include <stdio.h>

int f(int a, int b) {
    return a + b;
}

int main(void) {
    int (*pf)(int, int);   /* pf: a pointer to a function that gets two ints and returns an int */
    pf = f;                /* pf now holds the address of f */
    printf("%d\n", pf(4, 5));     /* 9 */
    printf("%d\n", (*pf)(4, 5));  /* 9: the same call, older style */
    return 0;
}
```

The declaration `int (*pf)(int, int);` looks strange at first. Read it from the name outwards:

| Piece | Meaning |
| --- | --- |
| `pf` | the name of the variable |
| `*pf` in parentheses | `pf` is a pointer |
| `(int, int)` on the right | the function it points to receives two `int`s |
| `int` on the left | that function returns an `int` |

Then:

- `pf = f;` stores the address of `f` in `pf`. No parentheses after `f`, because we are not calling it, only naming it.
- `pf(4, 5)` calls the function that `pf` points to, with 4 and 5. It prints 9.
- `(*pf)(4, 5)` does the same. You may follow the pointer with a star first, but C allows the shorter form, and most code uses it.

The lecture's slides write `void main()`. Standard C wants `int main(void)` and a `return 0;` at the end, so the code on this site uses that form.

:::trap
Dropping the parentheses around `*pf`. `int *pf(int, int);` declares a **function** named `pf` that returns an `int *`, not a pointer to a function. The parentheses in `int (*pf)(int, int);` are what make `pf` a pointer.
:::

:::check id=chk-store-function
With `int (*pf)(int, int);` declared, which line makes `pf` point to `f`?

- [x] `pf = f;`
- [ ] `pf = f(4, 5);`
- [ ] `pf(f);`

`f` without parentheses names the function, so `pf = f;` stores its address. `pf = f(4, 5);` would *call* `f` and try to store the result, 9, which is a number, not an address. `pf(f)` calls through `pf`, which does not point anywhere yet.
:::

## Passing a function to a function

Why would you want this? Because a function can then receive *another function* as an argument, and run it. One loop can do many different jobs.

Here are three small functions with the same shape: each receives a pointer to an `int` and returns nothing (`void`).

```c
void init(int *x)  { *x = 0; }                 /* set the value to 0 */
void sqr(int *x)   { int vx = *x; *x = vx * vx; } /* square the value */
void print(int *x) { printf("%d ", *x); }      /* print the value */
```

Now one function, `apply`, runs any of them on every element of an array:

```c
void apply(int A[], int size, void (*f)(int *)) {
    for (int i = 0; i < size; i++)
        f(&A[i]);   /* run f on the address of element i */
}
```

The third parameter, `void (*f)(int *)`, is a variable named `f` whose type is "pointer to a function that gets an `int *` and returns nothing". Inside the loop, `f(&A[i])` calls whatever function was passed in.

```c
int main(void) {
    int A[] = {1, 2, 3, 4, 5};
    apply(A, 5, sqr);    /* square every element */
    apply(A, 5, print);  /* prints: 1 4 9 16 25 */
    printf("\n");
    apply(A, 5, init);   /* set every element to 0 */
    apply(A, 5, print);  /* prints: 0 0 0 0 0 */
    printf("\n");
    return 0;
}
```

`apply` never changes. Only the function you hand it changes. The C library uses the same idea: its sorting function `qsort` receives a function that says which of two values should come first.

:::check id=chk-apply-twice
Start with `int B[] = {2, 3};` and run:

```c
apply(B, 2, sqr);
apply(B, 2, sqr);
apply(B, 2, print);
```

What does it print?

- [ ] `4 9`
- [x] `16 81`
- [ ] `2 3`

`apply` hands each function the address of an element, so `sqr` changes the array itself. The first call makes it {4, 9}, the second makes it {16, 81}, and only then does `print` run.
:::

## A shorter name with typedef

Writing `void (*f)(int *)` every time is tiring and easy to get wrong. In [Structures](topic:structures) you used `typedef` to give a type a new, short name. It works for function pointer types too:

```c
typedef void (*func)(int *);

void apply(int A[], int size, func f) {
    for (int i = 0; i < size; i++)
        f(&A[i]);
}
```

`typedef void (*func)(int *);` looks like a variable declaration with `typedef` in front. It does not make a variable. It makes `func` a new name for the type "pointer to a function that gets an `int *` and returns nothing". After that, `func f` reads almost like `int x`.

## An array of function pointers

Since function pointers are values, you can keep several in an array. This is a neat way to build a menu: the user's choice is the index.

```c
#include <stdio.h>

void add(int a, int b) { printf("%d+%d=%d\n", a, b, a + b); }
void sub(int a, int b) { printf("%d-%d=%d\n", a, b, a - b); }
void mul(int a, int b) { printf("%d*%d=%d\n", a, b, a * b); }

int main(void) {
    void (*A[])(int, int) = {add, sub, mul};  /* A: an array of 3 function pointers */
    int c, a = 15, b = 10;
    while (1) {                                /* repeat until break */
        printf("0 - add, 1 - subtract, 2 - multiply\n");
        if (scanf("%d", &c) != 1)              /* stop if no number was typed */
            break;
        if (c >= 0 && c <= 2)
            A[c](a, b);                        /* call the chosen function */
        else
            break;
    }
    return 0;
}
```

- `void (*A[])(int, int)` reads: `A` is an array (`A[]`) of pointers (`*`) to functions that get two `int`s (`(int, int)`) and return nothing (`void`). The braces fill it with `add`, `sub`, `mul`.
- `A[c](a, b)` picks the function at index `c` and calls it with 15 and 10. Typing 1 prints `15-10=5`.
- The check `c >= 0 && c <= 2` matters. `A[3]` does not exist, and calling a garbage "function address" is undefined behavior, usually a crash.

## A function that returns a function pointer

A function may also **return** a function pointer, so one part of the program decides which function another part will run.

```c
void print_square(int x) { printf("%d\n", x * x); }
void print_double(int x) { printf("%d\n", 2 * x); }

typedef void (*printer_fn)(int);

printer_fn get_printer(int mode) {
    if (mode == 1)
        return print_square;
    return print_double;
}

int main(void) {
    printer_fn printer = get_printer(1);
    printer(5);   /* 25 */
    printer = get_printer(2);
    printer(5);   /* 10 */
    return 0;
}
```

Without `typedef`, the same `get_printer` is written `void (*get_printer(int mode))(int)`, which is correct C but hard to read. That is exactly the kind of place where `typedef` pays off.

## Practice

:::problem id=prac-read-declaration title="Reading a function pointer type" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
:::check id=prac-read-declaration-q1
`double (*g)(double);` makes `g` a pointer to a function that receives {{=one double|two doubles|nothing}}.

The parentheses on the right list what the function receives: one `double`.
:::

:::check id=prac-read-declaration-q2
Which line makes a variable `h` that can point to `int max(int a, int b)`?

- [x] `int (*h)(int, int);`
- [ ] `int *h(int, int);`
- [ ] `int (*h)(int);`

The function gets two `int`s and returns an `int`, so the pointer type is `int (*)(int, int)`. The second line declares a function that returns `int *`. The third has the wrong list of parameters.
:::
:::

:::problem id=prac-apply-output title="What apply prints" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
Using `apply`, `sqr`, and `print` from this lesson:

```c
int A[] = {2, 3};
apply(A, 2, sqr);
apply(A, 2, sqr);
apply(A, 2, print);
```

:::check id=prac-apply-output-q1
The program prints {{=16 81|4 9|2 3}}.

Each `apply(A, 2, sqr)` squares both elements. After the first, `A` is {4, 9}; after the second, {16, 81}. Then `print` shows them.
:::
:::

:::problem id=prac-menu-index title="Calling through an array" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
In the menu program, `A` holds `{add, sub, mul}`, `a` is 15, and `b` is 10.

:::check id=prac-menu-index-q1
Typing 2 prints {{=15*10=150|15-10=5|15+10=25}}.

Index 2 is the third element of `A`, which is `mul`.
:::

:::check id=prac-menu-index-q2
Why does the program check `c >= 0 && c <= 2` before calling `A[c](a, b)`?

- [x] `A` has only three elements, so any other index reads a garbage address and "calls" it
- [ ] `scanf` cannot read numbers bigger than 2
- [ ] Function pointers only work with small indexes

C does not check array bounds. `A[5]` would read whatever bytes lie after the array and jump there as if it were a function, which is undefined behavior.
:::
:::

**Next:** [Memory on request: malloc and free](topic:malloc-and-free) leaves function pointers behind and turns to the main topic of the lecture: asking for memory while the program runs, and giving it back.
