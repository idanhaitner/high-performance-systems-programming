---
title: Copy a string into its own block
---

This exercise practices "Three string tools" and "Step 1: three names" from the lesson "Resizing memory and arrays of strings": a copy of a string needs `strlen` + 1 bytes, because `strcpy` also copies the `'\0'` at the end.

Write `copy_text(text)`. It returns a **new** heap block that holds a copy of the string `text`, using exactly as many bytes as the copy needs. For example:

```c
char name[] = "Mili";
char *copy = copy_text(name);
/* copy holds "Mili" in its own 5-byte block */
free(copy);
```

The copy must be separate: changing `name` afterwards must not change `copy`. The code that calls `copy_text` frees the copy when it is done.

The starter returns `text` itself, which is the same block, not a copy. Press Test first and see which cases fail.

You are done when Test shows all four cases passing.

:::hint
First work out how many bytes you need: `strlen(text)` letters, plus 1 for the `'\0'`.
:::

:::hint
Reserve that many bytes with `malloc` and keep the address in a `char *`. If `malloc` returns `NULL`, return `NULL`.
:::

:::hint
Copy with `strcpy(copy, text);` (destination first, then source), and return `copy`.
:::

:::case name="a short name"
The copy of "Mili" should read "Mili". If the test says the copy is the same block as the original, you returned `text` instead of a new block from `malloc`.
:::

:::case name="a separate block"
After the copy is made, the test changes the first letter of the original. The copy must not change. If it does, both pointers point to the same block.
:::

:::case name="the empty string"
The empty string "" has strlen 0, so its copy needs 1 byte, just for the `'\0'`. The copy should read "".
:::

:::case name="a longer name"
The copy of "Emanuel" should read "Emanuel". If the last letter is wrong or the program crashes, check that you asked for `strlen(text) + 1` bytes, not `strlen(text)`.
:::
