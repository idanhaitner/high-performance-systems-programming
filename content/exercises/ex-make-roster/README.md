---
title: Build an array of students
---

A heap block can hold many structures side by side. You then reach each one like an array element, as in `roster[1].id`.

Write `make_roster(n)`. It reserves an array of `n` students on the heap and returns its address. The ids are 1, 2, 3, and so on, and every grade is 0. The caller frees the array. If `n` is 0 or less, or there is no memory, return `NULL`.

You are done when Submit shows all three cases passing.

:::example
**Input:** `Student *r = make_roster(3);`

**Output:** `r[0].id` is 1, `r[2].id` is 3, and every `grade` is 0
:::

:::example
**Input:** `make_roster(0)`

**Output:** `NULL`
:::

:::hint
`calloc(n, sizeof(Student))` reserves the array and sets every byte to 0, so the grades are already 0.
:::

:::hint
`roster[i]` is one whole structure, not a pointer, so reach its member with a dot: `roster[i].id`.
:::

:::hint
Indexes count from 0 and ids count from 1, so store `i + 1`.
:::

:::case name="ids count from 1"
The first student is at index 0 and has id 1.
:::

:::case name="grades start at 0"
`malloc` leaves unknown values in the block. Use `calloc`, or set each grade yourself.
:::

:::case name="no students"
Check `n` before you ask for memory.
:::
