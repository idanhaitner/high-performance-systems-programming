---
title: Point to the largest element
---

To change the caller's **pointer**, a function needs the address of that pointer, a pointer to a pointer.

Write `point_to_max(pp, arr, n)`. `arr` is an array of `n` `int`s (at least one). `pp` is the address of the caller's pointer. After the call, the caller's pointer must point to the **largest** element of `arr`. If the largest value appears more than once, point to the first one. For example:

```c
int a[] = {4, 9, 2};
int *p = NULL;
point_to_max(&p, a, 3);
/* now p == &a[1], so *p is 9 */
```

The pointer must point **into** the array, not to a copy. So after the call, `*p = 0;` changes `a[1]`.

You are done when Test shows all four cases passing.

:::hint
Keep a local pointer `best` to the largest element seen so far. It starts at `&arr[0]`. In the loop, compare `arr[i]` with the value `best` points to, `*best`.
:::

:::hint
When `arr[i]` is larger than `*best`, make `best` point to that element: `best = &arr[i];`. Use `>`, not `>=`, so a tie keeps the first one.
:::

:::hint
`*pp` *is* the caller's pointer. After the loop, write `*pp = best;`. Writing `pp = best;` would only change your local copy of the address.
:::

:::case name="largest in the middle"
For {4, 9, 2}, the caller's pointer should end up at `a[1]`. If it is still NULL, you never stored anything into `*pp`.
:::

:::case name="largest at the end"
For {1, 5, 8}, the pointer should point to `a[2]`. If it points to `a[1]`, check that the loop runs all the way to `i < n`.
:::

:::case name="all negative"
For {-7, -3, -9}, the largest is -3 at `a[1]`. If you started `best` at a made-up value like 0 instead of at `arr[0]`, no element would ever look larger.
:::

:::case name="tie keeps the first"
For {6, 2, 6}, both 6s are largest; the pointer should point to `a[0]`. Use `>` rather than `>=`, so a later equal value does not replace the first. Writing through the pointer should then change `a[0]`.
:::
