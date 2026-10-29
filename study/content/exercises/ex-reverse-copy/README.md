---
title: Return a reversed copy of an array
---

This exercise practices "Asking for memory with malloc" and "Where the memory lives" from the lesson "Memory on request: malloc and free". A local array disappears when its function ends, but a heap block from `malloc` stays until someone frees it. So a function that hands back a new array must make it with `malloc`, and the caller frees it.

Write `reverse_copy(a, n)`. It returns a **new** heap array of `n` `int`s that holds the elements of `a` in reverse order. The original array `a` must not change. For example:

```c
int a[] = {1, 2, 3};
int *r = reverse_copy(a, 3);
/* r holds {3, 2, 1}, and a still holds {1, 2, 3} */
free(r);
```

The starter makes a local array, which is destroyed when the function returns, so it returns `NULL` instead. Press Test first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
The new array must outlive the function, so make it with `malloc(n * sizeof(int))`, not as a local `int r[n]`.
:::

:::hint
Element `i` of the copy comes from the other end of `a`. The last element of `a` is `a[n - 1]`, so `r[i] = a[n - 1 - i];`.
:::

:::hint
Only read from `a` and only write to `r`, so `a` keeps its order. Return `r` at the end.
:::

:::case name="three numbers"
The copy of {1, 2, 3} should be {3, 2, 1}. If the test says the result is NULL, return the block you made with `malloc`.
:::

:::case name="original unchanged"
After the call, `a` must still be {4, 5, 6, 7}. If it changed, you wrote into `a` instead of into the new array.
:::

:::case name="one number"
The copy of {9} is {9}. If this fails, check the index `n - 1 - i`.
:::
