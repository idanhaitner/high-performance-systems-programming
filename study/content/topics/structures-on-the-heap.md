---
id: structures-on-the-heap
title: Structures on the stack and on the heap
sources:
  - "ps2.pdf"
---

In [Structures](topic:structures) you bundled different values into one record. Since then you learned about the stack and the heap. This lesson puts them together: where a structure can live, how to reach its members in each case, how to keep an array of structures on the heap, and how the order of the members changes how much memory you use. Real programs keep most of their data in structures, so these habits come up constantly.

## A quick recap

A structure groups named values, called **members**, into one variable. `typedef` gives the type a short name:

```c
typedef struct {
    int x, y;
} Point;
```

A C structure only holds data. If you know Java, here is the difference:

| Topic | C `struct` | Java `class` |
| --- | --- | --- |
| Members that hold data | yes | yes |
| Functions that belong to the type (methods) | no | yes |
| Constructors | no | yes |
| Inheritance | no | yes |
| Where it can live | on the stack or the heap | objects live on the heap |
| What `=` does | copies every member | copies a reference to the same object |

## Dot or arrow

Here is the same structure, reached in two ways:

```c
Point p1 = {10, 20};
Point *pt = &p1;

p1.x = 15;    /* p1 is a structure: use a dot */
pt->y = 25;   /* pt is a pointer: use an arrow */
```

`pt->y` is a short way to write `(*pt).y`: follow the pointer, then take the member. To choose between them, ask one question: is the thing on the left a structure, or a pointer to one?

:::check id=chk-dot-or-arrow
`Point p = {1, 2};` and `Point *q = &p;`, where `Point` has an `int` member `x`. Which line does not compile?

- [x] `q.x = 5;`
- [ ] `q->x = 5;`
- [ ] `(*q).x = 5;`

`q` is a pointer, and a pointer has no members, so `q.x` is an error. The other two lines both follow the pointer first, and they mean the same thing.
:::

## On the stack or on the heap

A structure can live in either place, and the rules are the ones you already know.

```c
/* On the stack: released by itself when the function ends */
Point p1 = {10, 20};
p1.x = 15;

/* On the heap: stays until you free it */
Point *p2 = malloc(sizeof(*p2));
if (p2 == NULL)
    return 1;
p2->x = 15;
p2->y = 25;
free(p2);
p2 = NULL;
```

- `sizeof(*p2)` is the size of one `Point`. It stays correct if `p2` later points to a different type.
- You will often see `(Point *)malloc(...)`. That cast is allowed but not needed in C, because `void *` converts by itself.
- `p2` itself is a local variable on the stack. Only the block it points to is on the heap.

**Where to keep it?** Use the stack for a structure used only inside one function, and for anything small. Use the heap when it must outlive the function, when it is very large, or when you do not know in advance how many you need. A function that builds a structure and returns its address must use the heap, and the caller must free it.

Passing a pointer also saves work. `=` and function calls copy a whole structure, which is wasteful for a big one. Copying a pointer costs only 8 bytes on a typical 64-bit machine.

## An array of structures on the heap

A heap block can hold many structures side by side.

```c
typedef struct {
    int id;
    int grade;
} Student;

Student *students = malloc(3 * sizeof(*students));
if (!students)
    return 1;

students[1].grade = 90;   /* the SECOND student */

free(students);
```

`if (!students)` is a short way to write `if (students == NULL)`.

Which spelling reaches the second student? Indexes start at 0, so the second student is `students[1]`. And `students[1]` is a whole structure, not a pointer, so it takes a dot.

`students->grade` also compiles, but it means `students[0].grade`, the **first** student. A pointer to the start of an array points at element 0.

:::check id=chk-second-student
`Student *s = malloc(3 * sizeof(*s));`, where `Student` has an `int` member `grade`. Which line sets the grade of the second student?

- [x] `s[1].grade = 90;`
- [ ] `s->grade = 90;`
- [ ] `s[2].grade = 90;`

Indexes start at 0, so the second student is `s[1]`. `s->grade` is the first student, and `s[2]` is the third.
:::

## The order of the members matters

Do these two structures have the same size? They hold the same members, in a different order.

```c
typedef struct {
    char a;   /* 1 byte */
    int b;    /* 4 bytes */
    char c;   /* 1 byte */
} BadStruct;

typedef struct {
    int b;    /* 4 bytes */
    char a;   /* 1 byte */
    char c;   /* 1 byte */
} GoodStruct;
```

The members add up to 6 bytes in both. But recall from [Structures](topic:structures) that on a typical machine an `int` must start at a multiple of 4, so the compiler adds empty bytes, called **padding**. It also rounds the total size up to a multiple of 4, so that each element of an array stays aligned.

![BadStruct uses 12 bytes, with padding after a and after c. GoodStruct uses 8 bytes, with padding only at the end.](../assets/figures/struct-order.svg)

- `BadStruct`: `a` is byte 0. Bytes 1 to 3 are padding, so that `b` can start at 4. `b` is bytes 4 to 7, and `c` is byte 8. Bytes 9 to 11 are padding at the end. The total is **12**.
- `GoodStruct`: `b` is bytes 0 to 3, `a` is byte 4, and `c` is byte 5. Bytes 6 and 7 are padding at the end. The total is **8**.

That saves a third of the memory. Across an array of a million structures, it is 4 MB.

The rule of thumb: list the members from largest type to smallest, or at least keep the small ones together.

:::trap
Adding up the member sizes to get the size of a structure. Always use `sizeof`, and allocate with it too, as in `malloc(n * sizeof(Student))`.
:::

## Practice

:::problem id=prac-struct-arrow title="Reaching members" source="ps2.pdf" kind=exercise solution_origin=derived
`Student` has the members `int id` and `int grade`. The code has `Student s[3];` and `Student *p = s;`.

:::check id=prac-struct-arrow-q1
`p->id` is the same as {{=s[0].id|s[1].id|s.id}}.

`p` holds the address of element 0, so the arrow reaches the first student.
:::

:::check id=prac-struct-arrow-q2
`(p + 2)->grade` is the same as {{=s[2].grade|s[0].grade + 2|s[1].grade}}.

Adding 2 to a pointer moves it two whole structures forward, to element 2.
:::
:::

:::problem id=prac-struct-layout title="How big is it?" source="ps2.pdf" kind=exercise solution_origin=derived
Assume `char` is 1 byte, `int` is 4 bytes and starts at a multiple of 4, and the total is rounded up to a multiple of 4.

:::check id=prac-struct-layout-q1
`struct { char flag; int value; }` has size {{=8|5|4}}.

`flag` is byte 0, and bytes 1 to 3 are padding. `value` is bytes 4 to 7.
:::

:::check id=prac-struct-layout-q2
`struct { char a; char b; char c; int d; }` has size {{=8|7|16}}.

The three `char`s use bytes 0 to 2. Byte 3 is padding, and `d` is bytes 4 to 7.
:::

:::check id=prac-struct-layout-q3
`struct { int d; char a; }` has size {{=8|5|6}}.

The members use bytes 0 to 4. The total is rounded up to a multiple of 4, so 3 bytes of padding go at the end.
:::
:::

**Next:** [Finding memory bugs: GDB and Valgrind](topic:debugging-tools) shows the tools that find these mistakes for you, instead of leaving you to guess.
