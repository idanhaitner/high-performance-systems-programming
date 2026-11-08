---
id: realloc-and-strings
title: Resizing memory and arrays of strings
sources:
  - "Lecture 2 - Memory management.pptx"
---

In the last lesson you asked for a block with `malloc` and gave it back with `free`. This lesson does two more things with the heap. First, it **grows** a block that turned out too small, with `realloc`. Second, it solves a classic problem: storing several names of different lengths, using exactly as much memory as they need. On the way you meet `fgets`, reuse `strlen` and `strcpy` from [Working with strings](topic:strings), and put pointers to pointers from the first lesson to real use.

## Growing a block with realloc

You reserved room for 100 `int`s, filled it, and now need 20 more. You cannot just write past the end: those bytes are not yours. Instead, ask for a bigger block with `realloc` ("re-allocate"):

```c
int n1 = 100, n2 = 20;
int *A = malloc(n1 * sizeof(int));
for (int i = 0; i < n1; i++)
    A[i] = i;

A = realloc(A, (n1 + n2) * sizeof(int));  /* now room for 120 ints */
for (int i = n1; i < n1 + n2; i++)
    A[i] = i;
free(A);
```

`realloc` receives the old address and the **new total size in bytes**. Then it does one of two things:

1. If there is free space right after the old block, it simply **extends** the block, and returns the same address.
2. Otherwise it **moves**: it reserves a new block of the new size somewhere else, copies the old values into it, frees the old block, and returns the new address.

Either way, your first 100 values are still there, and you must use the address `realloc` **returns** from now on. The old address may already be freed.

:::definition id=def-realloc title="realloc" source="Lecture 2 - Memory management.pptx"
`realloc(p, size)` changes the size of the heap block at `p` to `size` bytes and returns the block's address, which may be new. The old contents are kept, up to the smaller of the two sizes. If it fails, it returns `NULL` and leaves the old block untouched.
:::

### A safer way to call realloc

That last sentence hides a trap. If `realloc` fails, it returns `NULL`, and `A = realloc(A, ...)` overwrites your only copy of the old address with `NULL`. The old block still exists, but you can never free it: a memory leak. Careful code keeps the answer in a second variable first:

```c
int *bigger = realloc(A, (n1 + n2) * sizeof(int));
if (bigger == NULL) {
    /* A is still valid here: use it or free it */
} else {
    A = bigger;
}
```

:::trap
Keeping the old pointer after `realloc` and using it. If the block moved, the old address was freed, so it is now a dangling pointer. Only the address `realloc` returned is safe to use.
:::

## The names problem

Here is the problem. We want to read **3 names**. Names have different lengths, and the longest possible name is 10 characters. The program must use **exactly** as much memory as the names need.

The first idea is a 2D array, a table of 3 rows with room for 10 letters plus the end marker in each:

```c
char A[3][11];
```

But "Mili" uses only 5 of its 11 bytes (4 letters and the `'\0'` that ends every string). Every short name wastes the rest of its row. That waste is what we want to avoid.

The better idea: keep an array of **pointers**, one per name, and give each name its own heap block of exactly the right size.

![A is an array of three pointers. Each points to its own heap block that is exactly as long as the name plus its end marker.](../assets/figures/names-array.svg)

Before writing it, we need three tools for strings. Remember from [Working with strings](topic:strings) that a string is an array of `char` that ends with `'\0'`, a byte with value 0. Two of the tools, `strlen` and `strcpy`, are from that lesson; here is a short recap, and one new tool.

## Three string tools

All three come from `<stdio.h>` and `<string.h>`.

**`fgets(buf, size, stdin)`** reads one line that the user types into the array `buf`. It reads at most `size - 1` characters, so it never writes past the end, and it always adds the `'\0'`. It also **keeps the newline** `'\n'` from pressing Enter, if that fit. (`stdin` means "the keyboard", the program's standard input.)

There is an older function, `gets(buf)`, that reads a line with **no** size limit. A long line overflows `buf` and overwrites other memory, so `gets` was removed from the C language in 2011. Always use `fgets`.

**`strlen(s)`** counts the characters in the string `s`, **not** counting the `'\0'`. `strlen("Mili")` is 4. It walks forward until it finds the 0 byte, so `strlen(NULL)` crashes.

**`strcpy(dest, src)`** copies the string `src`, **including** its `'\0'`, into the memory at `dest`. It does not check that `dest` is big enough; that is your job.

So to copy a name into its own block, you need `strlen(name) + 1` bytes: the letters plus one for the `'\0'`.

## Step 1: three names

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char *A[3];                      /* 3 pointers, one per name */
    char name[12];                   /* reading space: 10 letters, '\n', '\0' */
    for (int i = 0; i < 3; i++) {
        printf("Enter name: ");
        fgets(name, sizeof(name), stdin);
        name[strcspn(name, "\n")] = '\0';     /* cut off the newline */
        A[i] = malloc(strlen(name) + 1);      /* exactly enough bytes */
        strcpy(A[i], name);
    }
    for (int i = 0; i < 3; i++)
        printf("%s\n", A[i]);
    for (int i = 0; i < 3; i++)
        free(A[i]);
    return 0;
}
```

Line by line:

- `char *A[3];` is an array of 3 pointers to `char`. Each will hold the address of one name.
- `name` is a temporary reading space. The longest name is 10 letters, plus the `'\n'` that `fgets` keeps, plus the `'\0'`, so it needs 12 bytes. (Why not 11? With 11, a 10-letter name leaves its newline unread, and the next `fgets` reads just that newline as an empty name.)
- `strcspn(name, "\n")` gives the position of the first `'\n'` in `name` (or the end, if there is none). Storing `'\0'` there cuts the newline off, so it is not stored as part of the name.
- `malloc(strlen(name) + 1)` reserves exactly the letters plus the end marker. For "Mili" that is 5 bytes. We do not multiply by `sizeof(char)`, because a `char` is always exactly 1 byte.
- `strcpy(A[i], name)` copies the name into its new block. We need a copy, because `name` is reused for the next name.
- At the end, each block gets its own `free`.

You could also reserve the reading space with `malloc(12)` and free it at the end. A plain local array is simpler here, because its size is known when you write the code.

## Step 2: any number of names

Now we do not know how many names there will be until the program runs. So the array of pointers itself must come from the heap. An array of `char *` on the heap is reached through a pointer to its first element, and that pointer has type `char **`, a pointer to a pointer, as in the first lesson.

```c
int n = 3;                                 /* could come from the user */
char **A = malloc(n * sizeof(char *));     /* room for n pointers */
char name[12];
for (int i = 0; i < n; i++) {
    printf("Enter name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = '\0';
    A[i] = malloc(strlen(name) + 1);
    strcpy(A[i], name);
}
```

The only change is the first line. `malloc(n * sizeof(char *))` reserves room for `n` pointers. Each pointer is 8 bytes on a 64-bit machine, which is what `sizeof(char *)` says. After that, `A[i]` works exactly as before.

## Freeing everything, in the right order

There are now `n + 1` blocks: one per name, and one for the array of pointers. Free the **names first**, then the array:

```c
for (int i = 0; i < n; i++)
    free(A[i]);   /* each name's block */
free(A);          /* the array of pointers */
A = NULL;
```

Why this order? The addresses of the name blocks are stored *inside* the block `A`. If you freed `A` first, reading `A[i]` afterwards would read freed memory, and you would have no safe way left to reach the names. They would leak.

## Practice

:::problem id=prac-strlen-plus-one title="Bytes for a copy of a string" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
:::check id=prac-strlen-plus-one-q1
For `char name[20] = "Yehudit";`, a copy made with `malloc(sizeof(name))` gets {{=20 bytes, which works but wastes 12|8 bytes, exactly what it needs|7 bytes, which is one too few}}.

`sizeof` measures the array, not the text. `strlen(name) + 1` is the 8 bytes that the copy really needs.
:::

:::check id=prac-strlen-plus-one-q2
After `char *c = malloc(strlen(name)); strcpy(c, name);`, the problem is that {{=the '\0' is written one byte past the end|the copy has no '\0'|strcpy stops one letter early}}.

`strcpy` always copies the `'\0'`, whether or not there is room for it. The block is one byte too small, and C does not check.
:::
:::

:::problem id=prac-free-order title="Freeing an array of names" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=source
`char **A` was filled as in Step 2, with `n` names.

:::check id=prac-free-order-q1
How many calls to `free` does it take to free everything? {{=n + 1|1|n}}

One `free` per name block, plus one for the array of pointers.
:::

:::check id=prac-free-order-q2
Which order is right?

- [x] First `free(A[i])` for every `i`, then `free(A)`
- [ ] First `free(A)`, then `free(A[i])` for every `i`
- [ ] Only `free(A)`: it frees the names too

`free(A)` releases only the block of pointers. The names are separate blocks, and their addresses live inside `A`, so free them while you can still read `A[i]`.
:::
:::

:::problem id=prac-realloc-pattern title="Growing with realloc" source="Lecture 2 - Memory management.pptx" kind=exercise solution_origin=derived
`int *A = malloc(5 * sizeof(int));` holds 5 values. You need room for 8.

:::check id=prac-realloc-pattern-q1
What is the risk of writing `A = realloc(A, 8 * sizeof(int));`?

- [x] If `realloc` fails, `A` becomes `NULL`, and the old block can no longer be reached
- [ ] If `realloc` succeeds and moves the block, `A` still holds the old address
- [ ] `realloc` frees the old block first, so the 5 values are lost

On failure `realloc` returns `NULL` and leaves the old block alone. This line then overwrites the only copy of its address, which is a leak. Keep the answer in a second variable, and check it first.
:::

:::check id=prac-realloc-pattern-q2
After `int *B = realloc(A, 8 * sizeof(int));` succeeds, which is true?

- [x] Use `B` from now on; `A` may point to freed memory
- [ ] `A` and `B` are always the same address
- [ ] You must `free(A)` and then also `free(B)`

If `realloc` had to move the block, it already freed the old one. Use only the returned address, and free only that one, once.
:::
:::

**Next:** [Stack or heap?](topic:stack-or-heap) puts all of this together: when to reserve memory on the heap, when a plain local array is the better choice, and how a function can hand back an array it made.
