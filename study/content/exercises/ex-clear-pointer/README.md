---
title: Set the caller's pointer to NULL
---

A small one, from "Changing the middle pointer" in the lesson "Pointers to pointers": to change the caller's pointer, a function needs the address of that pointer.

Write `clear_pointer(pp)`. Here `pp` holds the address of the caller's pointer. After the call, the caller's pointer must be `NULL`, the value that means "points at nothing". The number it used to point to must not change. For example:

```c
int a = 1;
int *p = &a;
clear_pointer(&p);
/* now p is NULL, and a is still 1 */
```

The starter changes `pp`, which is only the function's own copy of that address. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
`pp` holds the address of the caller's pointer. Which expression *is* the caller's pointer?
:::

:::hint
`*pp` is the caller's pointer. Write `*pp = NULL;`. Do not write `**pp = ...`, because that would change the number.
:::

:::case name="pointer becomes NULL"
If `p` did not change, you changed only `pp`. Store into `*pp`.
:::

:::case name="the number stays"
Change the pointer, not the number it points to. `**pp` is the number, and `*pp` is the pointer.
:::

:::case name="only that pointer"
Change only the pointer whose address you received.
:::
