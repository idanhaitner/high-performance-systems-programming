---
id: generic-structures
title: Structures that hold any type
sources:
  - "ps3.pdf"
---

[Functions that work with any type](topic:generic-functions) showed that an address and a size are enough to handle a value of any type. This lesson keeps those two facts together in one structure. Then it goes one step further and puts a **function** inside the structure, so that each value knows how to print itself. It uses [structures](topic:structures) and [pointers to functions](topic:function-pointers), so reread those lessons if they feel far away.

## One structure for any value

A function like `generic_swap` always needs two things for each value: its address and its size. Passing them as two separate arguments is easy to get wrong. A structure can hold them as a pair:

```c
typedef struct {
    void *data;    /* the address of the value */
    size_t size;   /* the size of the value, in bytes */
} GenericBox;
```

`data` is a `void *`, so it can point at a value of any type. `size` says how many bytes that value takes.

![A box named GenericBox with two parts, data and size. The data part has an arrow pointing to a separate box that holds the int 42. The size part holds sizeof x.](../assets/figures/generic-box.svg)

The structure does **not** hold the value. It holds the address of the value, like a label that says where the thing is. The value stays where it was.

The same structure type can describe different types of values:

```c
int x = 42;
GenericBox a = {&x, sizeof x};
int xv = *(int *)a.data;           /* 42 */

double y = 3.14;
GenericBox b = {&y, sizeof y};
double yv = *(double *)b.data;     /* 3.14 */
```

`{&x, sizeof x}` fills the members in order: `data` gets `&x`, and `size` gets 4. To read the value back, you cast `data` to the type you know it holds, and follow it, as you did with `void *`.

Two things to remember:

- The box does **not** remember the type. Only you know that `a` holds an `int`. Cast it to the wrong type, and you read the wrong bytes.
- The box points at `x`, so `x` must still exist. If `x` is a local variable and the function ends, the box would point at memory that is gone.

:::check id=chk-box-read place=text
`double y = 3.14;` and `GenericBox b = {&y, sizeof y};`. Which line reads the value back?

- [x] `double v = *(double *)b.data;`
- [ ] `double v = b.data;`
- [ ] `double v = *b.data;`

`b.data` is only an address. It has no type, so `*b.data` is an error, and `double v = b.data;` would try to store an address in a number. First cast to `double *`, then follow it.
:::

## A function pointer inside a structure

Printing needs to know the type: an `int` prints with `%d`, and a `double` with `%f`. The box does not know the type, but you can give it a function that does.

Recall from [pointers to functions](topic:function-pointers) that a pointer can hold the address of a function, and that calling through the pointer runs that function. A structure member can be a function pointer too:

```c
typedef struct GenericBox GenericBox;

struct GenericBox {
    void *data;
    size_t size;
    void (*print)(const GenericBox *self);
};
```

Read the last member from the name outwards, as before. `print` is a pointer to a function that receives a `const GenericBox *` and returns nothing. The word `const` promises that the function will not change the box.

The first line, `typedef struct GenericBox GenericBox;`, is there because the member `print` mentions `GenericBox` **inside** the definition of `GenericBox`. The first line gives the type its short name before the details come, so the name can already be used.

Here are two functions that print a box, one for each type. They have the same shape, so either one can be stored in `print`:

```c
void print_int(const GenericBox *self) {
    const int *p = self->data;
    printf("%d\n", *p);
}

void print_double(const GenericBox *self) {
    const double *p = self->data;
    printf("%.2f\n", *p);
}
```

Each function takes the box, reads `self->data` (`->` follows a pointer to a structure and takes one of its members), casts it to the right type, and prints. The cast happens in the one place that knows the type.

Now build two boxes, each with its own printing function, and call them:

```c
int x = 42;
double y = 3.14;

GenericBox a = {&x, sizeof x, print_int};
GenericBox b = {&y, sizeof y, print_double};

a.print(&a);   /* runs print_int(&a), prints 42 */
b.print(&b);   /* runs print_double(&b), prints 3.14 */
```

![A box named GenericBox with three parts: data, size, and print. The data part points to the int 42, and the print part points to the function print_int. Below, the call box.print(&box) leads to print_int(&box).](../assets/figures/generic-box-print.svg)

The two lines look the same, but they run different code, because each box carries its own function pointer.

## What `self` means

Look at the call `a.print(&a);`. We pass `&a`, the address of the very box we call it on. That feels repeated, and the reason is that C has no methods.

In a language like Java, writing `a.print()` automatically gives the function a hidden `this`, which is the object it was called on. C does nothing like that. `a.print` is only a member that holds an address, and a call through it passes exactly what you write inside the brackets, and nothing else.

So we pass the box ourselves, and the function receives it in a parameter we call `self`. The name `self` is just a habit. Without it, `print_int` would have no way to find the data it should print.

:::definition id=def-callback-member title="Function pointer member" source="ps3.pdf"
A structure member that holds the address of a function. Calling it as `box.print(&box)` runs that function, and C does not pass the box by itself, so you hand it over as an ordinary argument.
:::

:::check id=chk-self-call place=text
`GenericBox b = {&y, sizeof y, print_double};` Which call prints the box?

- [x] `b.print(&b);`
- [ ] `b.print();`
- [ ] `print(b);`

`print_double` receives a pointer to the box as its parameter, and C does not add it for you. So you pass `&b` yourself. `print` is a member of the box, not a function on its own, so `print(b)` does not exist.
:::

## Many boxes, one loop

The real payoff comes when you keep boxes of different types in one array and treat them the same:

```c
int n = 7;
double r = 2.5;

GenericBox boxes[2] = {
    {&n, sizeof n, print_int},
    {&r, sizeof r, print_double},
};

for (int i = 0; i < 2; i++)
    boxes[i].print(&boxes[i]);
```

The loop does not know which box is which. It prints `7` and then `2.50`. Each box brings its own behavior. This is the idea behind **methods** in other languages: the data and the functions that work on it travel together.

C does not enforce any of this. Nothing stops you from storing `print_double` in a box that points at an `int`. It compiles, and prints nonsense.

:::trap
Pairing a function with the wrong data, as in `GenericBox a = {&x, sizeof x, print_double};` where `x` is an `int`. The compiler cannot see the mismatch, because `data` is a `void *`. The program reads 4 bytes of `x` and the 4 bytes after it, and treats them as a `double`.
:::

## Practice

:::problem id=prac-box-members title="What does the box hold?" source="ps3.pdf" kind=exercise solution_origin=derived
`int x = 42;` and `GenericBox a = {&x, sizeof x};`, where `GenericBox` has the members `void *data` and `size_t size`.

:::check id=prac-box-members-q1
`a.size` is {{=4 on a typical machine|42|the address of x}}.

`size` is the number of bytes in the value, which is `sizeof x`. The number 42 is the value itself.
:::

:::check id=prac-box-members-q2
If `x` is later set to 99 with `x = 99;`, then `*(int *)a.data` is {{=99|42|unknown}}.

The box holds the address of `x`, not a copy of its value, so it sees the new value.
:::
:::

:::problem id=prac-box-print title="Which function runs?" source="ps3.pdf" kind=exercise solution_origin=derived
`GenericBox a = {&i, sizeof i, print_int};` and `GenericBox b = {&d, sizeof d, print_double};`, where `i` is an `int` and `d` is a `double`.

:::check id=prac-box-print-q1
`b.print(&b);` runs {{=print_double|print_int|neither, it does not compile}}.

Each box carries the address of its own function, and `b` was built with `print_double`.
:::

:::check id=prac-box-print-q2
In `a.print(&a);`, the `&a` is there because {{=C does not pass the box to the function by itself|print_int needs the address of the screen|it is required by the compiler for every call}}.

C has no methods. A call through a function pointer passes only the arguments you write.
:::
:::

**Next:** [A bump allocator: writing your own malloc](topic:bump-allocator) is a different kind of memory tool, built from one big array and a counter.
