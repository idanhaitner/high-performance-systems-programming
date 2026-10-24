# 10 — Structs

An array groups many values of the **same** type. A **struct** groups a few values of possibly **different** types under one name, such as the `x` and `y` of a point, or the name and id of a student. This lesson shows how to define a struct, pass it to functions, and how it is laid out in memory.

## Defining and using a struct

```c
struct point {
    int x;
    int y;
};

struct point p;
p.x = 2;
p.y = 5;
```

- `struct point { ... };` defines a new type named `struct point`. Note the `;` after the closing brace. Forgetting it gives a confusing error.
- `x` and `y` are its **fields**: the named values inside it.
- `struct point p;` creates a variable of that type.
- `p.x` is the field `x` of `p`. The `.` reads or writes one field.

You can also give all fields at once, in the order they were defined:

```c
struct point p = {2, 5};
```

## Structs are copied

A struct behaves like an `int` when you assign it or pass it to a function: the whole struct is **copied**.

```c
struct point copy = p;
copy.x = 9;          /* p.x is still 2 */
```

A function that takes a `struct point` gets its own copy. Changing it does not change the caller's struct. A function can also return a struct; the caller receives a copy.

## Passing a pointer to a struct

As with `int`s in lesson 07, to change the caller's struct, pass its address:

```c
void point_move(struct point* p, int dx, int dy) {
    p->x = p->x + dx;
    p->y = p->y + dy;
}

point_move(&p, 1, -2);
```

`p->x` means "the field `x` of the struct that `p` points at". It is a short way to write `(*p).x`. The parentheses in `(*p).x` are needed, because C applies `.` before `*`. Without them, `*p.x` would mean `*(p.x)`, which is wrong.

Passing a pointer also avoids copying. For a large struct, that is faster.

## How a struct sits in memory

The fields are stored in the order you write them. `sizeof` gives the size of the whole struct, and `offsetof`, from `<stddef.h>`, gives how many bytes from the start each field begins.

```text
struct point, on this machine
  offset 0    x    4 bytes
  offset 4    y    4 bytes
  sizeof = 8

struct sample { char name[8]; int id; }, on this machine
  offset 0    name    8 bytes
  offset 8    id      4 bytes
  sizeof = 12
```

Sometimes the compiler adds unused bytes between fields. This is called **padding**. The processor reads an `int` fastest when its address is a multiple of 4, so the compiler moves the `int` to such an address:

```text
struct padded { char tag; int value; }, on this machine
  offset 0    tag      1 byte
  offset 1    (padding, 3 unused bytes)
  offset 4    value    4 bytes
  sizeof = 8, not 5
```

That is why the size of a struct can be larger than the sum of its fields. The exact sizes depend on the machine, so ask `sizeof` and `offsetof` when you need the numbers. Do not memorize them. Later in the course, layout matters for speed, because it decides how much useful data fits in each read from memory.

## What the demo prints

```text
point is (2, 5)
sizeof(struct point) = 8
offset of y = 4
sample name starts with A
sizeof(struct sample) = 12
offset of id = 8
sizeof(struct padded) = 8
offset of value = 4
after editing the copy, p.x = 2
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. Then:

```bash
make try LESSON=10-structs
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [ownership](../11-ownership/lesson.md), where a struct holds a pointer to heap memory.
