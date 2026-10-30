---
title: Read a number, then a letter
---

Pressing Enter leaves a newline in the input buffer, and `%c` reads it as if it were your letter.

Write a whole program, with its own `main`. It asks for a number and then a character, and prints both. The tests type the answers for you, each followed by Enter.

Notice that both questions appear on one line in the output below, because the typed answers are not printed: in a real terminal, your typing would show up between them.

You are done when Test shows all three cases passing.

:::example
**Input:** typing `5`, Enter, `a`, Enter

**Output:** `Enter a number: Enter a character: x = 5, ch = 'a'`
:::

:::example
**Input:** typing `-12`, Enter, `Z`, Enter

**Output:** `Enter a number: Enter a character: x = -12, ch = 'Z'`
:::

:::hint
If `ch` is printed as `'` followed by a line break, which character was waiting in the buffer right after you typed the number and pressed Enter?
:::

:::hint
The leftover character is the newline from pressing Enter. You need to skip it before reading the letter.
:::

:::hint
Put a space before `%c`: `scanf(" %c", &ch);`. The space tells `scanf` to skip spaces and newlines before it reads the character.
:::

:::case name="a small letter"
Input `5`, Enter, `a`, Enter. The last line should be `x = 5, ch = 'a'`. If `ch` came out as a line break, `%c` read the newline left after the number.
:::

:::case name="a negative number"
Input `-12`, Enter, `Z`, Enter. `%d` reads the minus sign as part of the number, so the line should end with `x = -12, ch = 'Z'`.
:::

:::case name="spaces before the letter"
Input `42`, Enter, then three spaces and `q`. With `" %c"` the spaces are skipped too, so `ch` should be `'q'`.
:::
