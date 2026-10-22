# 10 — Structs

A struct is one object made of named fields. The fields can have different types. They are stored in the order you write them.

## Fields

```c
struct point {
    int x;
    int y;
};

struct point p;
p.x = 2;
p.y = 5;
```

`struct point` is the type. `p.x` is the field `x` of the object `p`. A struct used as a function argument, or returned, is copied field by field. Editing the copy does not edit the original. The demo copies a point, changes the copy's `x`, and prints the original.

To change the caller's struct, pass a pointer.

```c
void point_move(struct point* p, int dx, int dy) {
    p->x = p->x + dx;
    p->y = p->y + dy;
}
```

`p->x` means `(*p).x`. The parentheses matter, because `.` binds tighter than `*`.

## Layout

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

The compiler may insert unused bytes so a field starts at an address it prefers. That padding is why `sizeof` of a struct can be larger than the sum of the fields you wrote. On this machine these two structs have no padding. Ask `sizeof` and `offsetof` from `<stddef.h>` when you need the numbers. Do not memorize them.

```c
offsetof(struct sample, id)
```

## What the demo prints

```text
point is (2, 5)
sizeof(struct point) = 8
offset of y = 4
sample name starts with A
sizeof(struct sample) = 12
offset of id = 8
after editing the copy, p.x = 2
```

Those sizes and offsets are the numbers on this machine.

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=10-structs
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [ownership](../11-ownership/lesson.md).
