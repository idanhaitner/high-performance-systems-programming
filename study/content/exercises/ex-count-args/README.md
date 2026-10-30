---
title: Count the words after the program's name
---

A small one, from "Receiving the arguments: argc and argv" in the lesson "Command-line arguments": `argc` counts every word on the command line, and that count includes the program's own name.

Write a program that prints how many words were typed **after** the program's name, then a newline:

| Command | `argc` | Prints |
| --- | --- | --- |
| `./count` | 1 | `0` |
| `./count hello` | 2 | `1` |
| `./count a b c` | 4 | `3` |

The starter prints `argc` as it is. Press Test my code first and see which cases fail.

You are done when Test shows all three cases passing.

:::hint
`argv[0]` is the program's own name, and `argc` counted it too. How do you leave it out?
:::

:::hint
Print `argc - 1`.
:::
