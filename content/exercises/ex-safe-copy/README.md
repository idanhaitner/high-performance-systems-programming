---
title: Copy text without overflowing
---

`strcpy` keeps writing until the text ends, even past the end of the array. That is a **buffer overflow**: it overwrites whatever sits next to the array, and the program may seem fine until much later.

Write `safe_copy(dest, size, src)`. It copies the string `src` into `dest`, an array of `size` bytes, and never writes outside it. If the text does not fit, keep as many letters as fit. The result must always end with `'\0'`. `size` is at least 1.

You are done when Submit shows all three cases passing.

:::example
**Input:** `char a[8]; safe_copy(a, 8, "Dana");`

**Output:** `a` holds `Dana`
:::

:::example
**Input:** `char a[4]; safe_copy(a, 4, "Dana");`

**Output:** `a` holds `Dan`, because three letters and the `'\0'` use all 4 bytes
:::

:::hint
Out of `size` bytes, one must hold the `'\0'`, so at most `size - 1` letters fit.
:::

:::hint
Copy one letter at a time. Keep going while `i < size - 1` and `src[i] != '\0'`.
:::

:::hint
After the loop, `i` is the spot right after the last letter. Write `dest[i] = '\0';` there.
:::

:::case name="short text fits"
Copy the letters, then end the result with `'\0'`.
:::

:::case name="exactly full"
Seven letters and `'\0'` fit exactly in 8 bytes. Stopping one letter early is a common slip.
:::

:::case name="long text is cut"
Stop at `size - 1` letters, and do not forget the `'\0'`.
:::
