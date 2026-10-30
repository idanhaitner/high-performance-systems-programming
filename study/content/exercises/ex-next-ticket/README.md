---
title: A ticket counter that remembers
---

A local variable lives on the stack and is destroyed when its function ends, while a global lives in `.data` or `.bss` for the whole run.

Think of the ticket machine at a post office. Each person who presses the button gets the next number: 1, then 2, then 3. The machine must remember the last number it gave out.

Write the **function** `next_ticket()`. (A function is a named piece of code that gives back, or **returns**, an answer each time it is called.) It takes no input. The first call returns 1, the second returns 2, the third returns 3, and so on.

The starter keeps the count in a plain local variable. A local variable is created fresh, at its starting value, every time the function starts, and destroyed when it returns. So the count goes back to 0 on every call, and every call returns 1.

C has a word for a local variable that remembers: `static`. Writing `static` in front of a local variable changes where it lives. It moves off the stack and into the program's global data: `.bss` if it starts at 0, `.data` otherwise. It is set to its starting value only once, before the program starts running, and it keeps its value between calls. Only code inside the function can use its name, just like a normal local.

The tests call `next_ticket()` many times in a row, in one run: once, once more, then ten more times. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
Run Test. The first case passes but the second fails, because the second call also returns 1. What happens to `count` when the function returns?
:::

:::hint
`count` must survive from one call to the next. A plain local variable cannot, because it is destroyed when the function returns.
:::

:::hint
Put `static` at the start of the line that creates `count`. The `= 0` then happens only once, not on every call.
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
