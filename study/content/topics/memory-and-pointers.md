---
id: memory-and-pointers
title: Memory and pointers
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/06-arrays-and-strings/lesson.md
  - c/07-pointers/lesson.md
---

An object has a type, a value, and, when it occupies memory, an address. A pointer stores an address. An array stores elements of one type in adjacent memory. The addresses in the diagrams are examples; address-space layout randomization changes the numeric values between runs.

## Bytes and addresses

:::definition id=def-bit title="Bit" source="Lecture 1 - Introduction.pdf"
A bit is a binary digit. Its value is 0 or 1.
:::

:::definition id=def-byte title="Byte" source="Lecture 1 - Introduction.pdf"
A byte is the smallest unit of memory that has its own address. On every machine in this course a byte is 8 bits. Diagrams draw the most significant bit on the left and the least significant bit on the right.
:::

:::definition id=def-ram title="Address" source="Lecture 1 - Introduction.pdf"
An address is a number that identifies one byte. Memory can be pictured as an array of bytes numbered from 0 to $2^n - 1$, where $n$ is the address width in bits. A C pointer holds an address in the process's virtual address space, not a physical RAM location, and not every number in that range points to usable memory.
:::

![A byte contains eight bits, with the most significant bit drawn on the left.](../assets/figures/ram-byte.svg)

On this 64-bit platform a pointer occupies 8 bytes. Which addresses may actually be used depends on what the operating system has mapped into the process and with which permissions.

:::check id=chk-byte
In the course's byte diagram, which bit is drawn on the left?

- [ ] The least significant bit
- [x] The most significant bit
- [ ] The sign bit of a C `int`

The diagram places bit 7, the most significant bit of an 8-bit byte, on the left. That drawing convention is separate from the sign bit of a wider integer.
:::

## Objects, scope, and storage

:::definition id=def-object title="Value and address" source="Lecture 1 - Introduction.pdf"
A variable names an object, and an object has a value. An object in memory also has an address: the address of its first byte. If a program never takes an object's address, the compiler may keep it only in a register or remove it entirely.
:::

```c
int x = 5;
printf("%d\n", x);          /* value */
printf("%p\n", (void *)&x); /* address, if x has one */
```

`%d` prints an `int`. `%p` prints a pointer and expects a `void *`, so the address is cast. The address you see will differ from run to run and from the examples here.

```c
#include <stdio.h>

int x = 10; /* file scope, static storage, external linkage */
int y;      /* file scope, static storage, initialized to zero */

int main(void) {
    int z = 5;                   /* block scope, automatic storage */
    int a[4] = {10, 20, 30, 40}; /* block scope, four adjacent ints */
    printf("z = %d\n", z);
    return 0;
}
```

Three separate properties describe each variable:

- **Scope** is where the name is visible. `x` and `y` are visible from their declaration to the end of the file. `z` and `a` are visible only inside `main`.
- **Linkage** decides whether other files can refer to the name. Another file can use `x` by declaring `extern int x;`. Adding `static` to a file-scope declaration hides it from other files.
- **Storage duration** is how long the object exists. `x` and `y` have static storage duration: they exist for the whole run, and `y`, which has no initializer, starts at zero. `z` and `a` have automatic storage duration: they are created each time `main` is entered and destroyed when it returns, so their addresses are valid only during that time.

## Pointers

:::definition id=def-pointer title="Pointer" source="Lecture 1 - Introduction.pdf"
A pointer object stores the address of an object of a stated type, or a null pointer value.
:::

```c
int x = 5;
int *p = &x;
```

In the example, `x` is at `0x1000` and holds 5, while `p` is at `0x2000` and holds `0x1000`. Thus `p == &x`.

![The pointer object p stores the address of x.](../assets/figures/pointer-boxes.svg)

:::definition id=def-dereference title="Dereference" source="Lecture 1 - Introduction.pdf"
If `p` points to an object, `*p` designates that object. Assigning to `*p` stores into it. Dereferencing a null pointer or any other pointer that does not point to an object is undefined behavior.
:::

| Expression | Meaning |
| --- | --- |
| `x` | the value stored in `x` |
| `&x` | the address of `x` |
| `p` | the address stored in `p` |
| `*p` | the object at the address stored in `p` |

```c
*p = 100;
printf("%d\n", x);  /* 100 */
printf("%d\n", *p); /* 100 */
```

Because `p` holds `&x`, the expressions `x` and `*p` name the same object, so both print 100. Writing `p = 100` instead is an error: it tries to store an integer in a pointer, which C does not allow without a cast. Even with a cast it would change where `p` points, not the value of `x`.

:::problem id=worked-dereference title="Write 100 through a pointer" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Start from `int x = 5; int *p = &x;`. After `*p = 100`, what do `x` and `*p` print, and why are they equal?

:::solution
Both print 100. `p` holds `&x`, so `*p` designates `x`. The assignment stores 100 in that object. The two expressions read it.
:::
:::

:::trap
Writing `p = 100` to change `x`. That assigns to the pointer itself, and an `int` cannot be assigned to a pointer. To store into the object `p` points to, write `*p = 100`.
:::

## Arrays and pointer arithmetic

:::definition id=def-contiguous title="Array" source="Lecture 1 - Introduction.pdf"
An array is a sequence of elements of one type, stored contiguously in index order. There is no gap between `a[i]` and `a[i + 1]`.
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

The distance is 4 because these elements have type `int` and `sizeof(int)` is 4 on this platform. An array name used in an expression converts to a pointer to its first element, except when it is the operand of `sizeof` or unary `&`.

```c
int *p = a; /* address of a[0] */
/* p     == 0x1000 */
/* p + 1 == 0x1004 */
/* p + 2 == 0x1008 */
```

If `p` points to an array element, `p + k` points `k` elements later, which is `k * sizeof(*p)` bytes further. For an `int *` on this platform, adding 1 moves 4 bytes. The result must stay inside the same array or point exactly one past its last element. That one-past pointer may be computed and compared, but not dereferenced.

![Four int elements at addresses four bytes apart.](../assets/figures/array-layout.svg)

:::definition id=def-subscript title="Subscript" source="Lecture 1 - Introduction.pdf"
By definition, `a[i]` means `*(a + i)`. The index counts elements, and pointer addition scales that count by the element size.
:::

For this array, `a[2]` and `*(a + 2)` both name the element at `0x1008`, whose value is 30. C does not check bounds: reading `a[4]` or `a[-1]` compiles, but its behavior is undefined. A function that receives an array as `int *a` does not receive its length, so the caller must pass the length separately.

A string is an array of `char` ending with the null character `'\0'`, whose code is 0. It is not the digit `'0'`, whose ASCII code is 48. Functions such as `printf` with `%s` find the end of a string only by looking for that terminator.

:::problem id=worked-index-equivalence title="a[2] and *(a + 2)" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
For `int a[4] = {10, 20, 30, 40}` starting at `0x1000`, give the address and value designated by `a[2]` and by `*(a + 2)`.

:::solution
Both expressions designate element 2. Its address is `0x1008` and its value is 30. The addition advances by two elements, not by two bytes.
:::
:::

:::trap
Adding 1 to an `int *` as though it advanced one byte. The address advances by `sizeof(int)`. The bytes between `0x1000` and `0x1004` belong to `a[0]`.
:::

## Practice

:::problem id=prac-value-and-address title="Value, address, and dereference" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`int x = 5;` and `int *p = &x;`. In this example, `x` is at `0x1000` and `p` is at `0x2000`.

:::check id=prac-value-and-address-q1
`p == &x` is {{=true|false|true only after *p = 100}}.

`p` was initialized with `&x`, so it stores the address of `x`.
:::

:::check id=prac-value-and-address-q2
After `*p = 100`, the value of `x` is {{=100|5|0x1000}}.

`*p` designates `x`. The assignment writes 100 into that object.
:::

:::check id=prac-value-and-address-q3
Which reading of `p` matches the example?

- [x] `p` stores `0x1000`, the address of `x`
- [ ] `p` is the address of the pointer object, and that address is `0x1000`
- [ ] `p` stores the `int` value 5

The pointer object itself is at `0x2000`. Its contents are the address of `x`.
:::
:::

:::problem id=prac-pointer-step title="How far p + 1 moves" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`int a[4] = {10, 20, 30, 40};` and `int *p = a;`, with `a[0]` at `0x1000`. Here `sizeof(int)` is 4.

:::check id=prac-pointer-step-q1
`p + 1` evaluates to {{=0x1004|0x1001|0x1008}}.

The offset is scaled by `sizeof(*p)`, which is 4.
:::

:::check id=prac-pointer-step-q2
`p + 2` evaluates to {{=0x1008|0x1002|0x100C}}.

Two elements past `0x1000` is `0x1000 + 8`.
:::

:::check id=prac-pointer-step-q3
The scale factor in `p + k` is

- [x] `sizeof(*p)`, the size of the referenced type
- [ ] Always 1 byte, regardless of type
- [ ] The number of elements in the array

Pointer addition counts elements. The byte distance is that count multiplied by the element size.
:::
:::

:::problem id=prac-array-formula title="The subscript formula" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-array-formula-q1
The language definition states {{=a[i] == *(a + i)|a[i] == *a + i|a[i] == &(a + i)}}.

A subscript dereferences the pointer produced by adding the index to the base.
:::

:::check id=prac-array-formula-q2
For the array `{10, 20, 30, 40}`, `*(a + 2)` is {{=30|20|0x1008}}.

`a + 2` is the address `0x1008`. The dereference reads the `int` stored there. The address itself is `a + 2`, without the star.
:::
:::

:::problem id=prac-first-program-roles title="Scope and lifetime in the sample" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use the program with file-scope `x` and `y`, and block-scope `z` and `a[4]` inside `main`.

:::check id=prac-first-program-roles-q1
Which objects have file scope in that file?

- [x] `x` and `y`
- [ ] `z` and `a`
- [ ] Only `x`, because `y` has no initializer

Both `x` and `y` are declared outside any function. A missing initializer affects only the initial value (zero), not the scope.
:::

:::check id=prac-first-program-roles-q2
`printf("z = %d\n", z)` prints {{=5|10|the address of z}}.

`z` was initialized to 5, and `%d` prints that `int`.
:::

:::check id=prac-first-program-roles-q3
The elements of `a` are stored

- [x] Contiguously, in index order from `a[0]` through `a[3]`
- [ ] In separate allocations whose gap is chosen by `printf`
- [ ] On four different devices, one element each

An array occupies one contiguous sequence. Its lifetime here is the execution of `main`, because `a` has automatic storage duration.
:::
:::

The next lesson, [Structures](topic:structures), groups members of different types into one object. Their order is fixed, but padding may separate them.
