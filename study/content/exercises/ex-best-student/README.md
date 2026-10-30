---
title: Find the best student
---

A structure bundles several values into one record, and a dot reaches one member, as in `s.grade`.

The code already describes a student:

```c
struct student {
    char name[32];
    int id;
    int grade;
};
```

Write the **function** `best_index(s, n)`. (A function is a named piece of code that receives values and gives back, or **returns**, one answer.) It receives an **array** of `n` students, that is, `n` student records side by side in memory. It returns the **index** of the student with the highest grade. The index is the student's position in the array, counting from 0.

Two details about the inputs:

- `s` is a pointer to the first student, just as an array passed to a function arrives as a pointer to its first element. You still reach student number `i` with `s[i]`, and that student's grade with `s[i].grade`.
- `const` in front means the function promises only to read the students, not to change them.

If several students share the highest grade, return the **first** of them, the one with the smallest index. `n` is always at least 1. For example, with grades 70, 85, 92 the answer is 2, and with grades 80, 95, 95, 50 the answer is 1.

You are done when Test shows all three cases passing.

:::hint
Keep a variable `best` that holds the index of the best student seen so far. Start it at 0, since the first student is the best of a group of one.
:::

:::hint
Use a loop with `i` going from 1 up to `n - 1`. For each student, compare `s[i].grade` with `s[best].grade`.
:::

:::hint
Update `best` only when the new grade is strictly higher, with `>`. Using `>=` would move `best` to a later student with the same grade.
:::

:::case name="best is last"
The highest grade, 92, belongs to the last student, at index 2. Make sure your loop looks at every student, all the way up to index `n - 1`.
:::

:::case name="best is first"
The first student, at index 0, has the highest grade. Your function must still return 0 after looking at the others, so only move `best` when a grade is higher than the best so far.
:::

:::case name="tie keeps the first"
Two students share the top grade, 95, at index 1 and index 2. The first one, index 1, must win. Compare with `>`, not `>=`, so an equal grade does not replace the one you already have.
:::
