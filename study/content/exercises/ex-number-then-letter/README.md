---
title: Read a number, then a letter
---

This exercise practices "The input buffer: why scanf skips input" from the lesson "Printing and reading values": pressing Enter leaves a newline in the input buffer, and `%c` reads it as if it were your letter.

This is a whole program, with its own `main`. It asks for a number and then a character, and prints both. The tests type the answers for you, each followed by Enter. For example, when the input is

```text
5
a
```

the program must print exactly:

```text
Enter a number: Enter a character: x = 5, ch = 'a'
```

(The two questions appear on one line because the typed answers are not printed: in a real terminal, your typing would show up between them.)

The starter reads the character with `scanf("%c", &ch)`. Press Test my code first and look at what it prints for `ch`.

You are done when Test shows all three cases passing.

:::hint
Look at the output of a failed case: `ch` is printed as `'` followed by a line break. Which character is waiting in the buffer right after you typed the number and pressed Enter?
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
