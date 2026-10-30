---
title: A ticket counter that remembers
---

A local variable lives on the stack and is destroyed when its function ends, while a global lives in `.data` or `.bss` for the whole run.

Think of the ticket machine at a post office. Each person who presses the button gets the next number: 1, then 2, then 3. The machine must remember the last number it gave out.

Write the **function** `next_ticket()`. (A function is a named piece of code that gives back, or **returns**, an answer each time it is called.) It takes no input. Each call returns a number one bigger than the call before it, starting at 1.

A plain local variable cannot do this. It is created fresh, at its starting value, every time the function starts, and destroyed when it returns.

C has a word for a local variable that remembers: `static`. Writing `static` in front of a local variable changes where it lives. It moves off the stack and into the program's global data: `.bss` if it starts at 0, `.data` otherwise. It is set to its starting value only once, before the program starts running, and it keeps its value between calls. Only code inside the function can use its name, just like a normal local.

The tests call `next_ticket()` many times in a row, in one run: once, once more, then ten more times.

You are done when Submit shows all three cases passing.

:::example
**Input:** `next_ticket()` called three times in a row

**Output:** `1`, then `2`, then `3`
:::

:::example
**Input:** `next_ticket()` called twelve times in a row

**Output:** the twelfth call returns `12`
:::

:::hint
If the first case passes but the second fails, the second call also returned 1. What happens to your count when the function returns?
:::

:::hint
The count must survive from one call to the next, so it needs the word from the text.
:::

:::hint
Write `static int count = 0;`. The `= 0` then happens only once, not on every call.
:::

:::case name="first call is 1"
The very first call should return 1. Start the count at 0 and add 1 before returning it.
:::

:::case name="counts up"
The second call returned the same number as the first. The count was reset between calls, which is what happens to a plain local variable. Make `count` a `static` local so it keeps its value.
:::

:::case name="ten calls"
After two calls, ten more calls should end at 12. If the last call returned 1, the count is still being reset on every call.
:::
