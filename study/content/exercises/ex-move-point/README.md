---
title: Move a point through a pointer
---

When you have a pointer to a structure, `p->x` is the member `x` of the structure it points to.

Write `move_right(p, dx)`. It adds `dx` to the `x` of the point that `p` points to, and leaves `y` as it is. For example:

```c
struct point a = {1, 2};
move_right(&a, 5);
/* now a.x is 6 and a.y is still 2 */
```

The starter moves a copy of the point, so `a` does not change. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
`copy` is a separate structure, so changing it does not reach the caller. You do not need a copy at all.
:::

:::hint
Write `p->x = p->x + dx;`, and remove the lines that use `copy`.
:::

:::case name="moves right"
If `a.x` is still 1, you changed a copy. Use `p->x` to reach the caller's point.
:::

:::case name="moves left"
A negative `dx` moves the point left. Just add `dx`, with no special case.
:::

:::case name="y stays"
Do not change `y` at all.
:::
