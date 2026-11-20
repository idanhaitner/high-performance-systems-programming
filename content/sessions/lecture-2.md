---
id: lecture-2
lecture: lecture-2
title: "Lecture 2 practice: memory management"
---

:::learn title="How this practice works"
This practice goes over the main ideas of the lecture: a few quick questions, a few coding exercises, and one lab at the end that you do on your own computer in VS Code, a free code editor.

In an exercise, the panel on the left says what the function must do, and you write it on the right. **Run** shows what your code prints, and **Submit** checks it against small tests. If you are stuck, open **Hints** one at a time, or use the **Reread** link to open the step's lesson.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press **Run** or **Submit**.
:::

:::check id=q-two-names-one-array lesson=pointer-arithmetic
What does this print?

```c
int A[5] = {10, 20, 30, 40, 50};
int *p = &A[1];
int *q = p + 2;
printf("%d %d\n", *q, p[1]);
```

- [ ] `30 20`
- [ ] `40 20`
- [x] `40 30`

`p` points at `A[1]`, so `q` points two elements later, at `A[3]`, which holds 40. `p[1]` means "one element after `p`", which is `A[2]`, and it holds 30.
:::

:::check id=q-repoint-function lesson=function-pointers
What does this print?

```c
int twice(int x) { return x * 2; }
int plus_one(int x) { return x + 1; }

int main(void) {
    int (*f)(int) = twice;
    int r = f(3);
    f = plus_one;
    printf("%d\n", f(r));
}
```

- [ ] `8`
- [x] `7`
- [ ] `4`

The first call goes to `twice`, so `r` is 6. Then `f` is pointed at `plus_one`, so `f(r)` is 6 + 1, which is 7.
:::

:::exercise ref=ex-count-if lesson=function-pointers
:::

:::check id=q-whose-frame lesson=stack-frames
Which function is correct?

- [x] `void set(int *p) { *p = 9; }`, called as `int x; set(&x);`
- [ ] `int *get(void) { int x = 9; return &x; }`
- [ ] `int *get(void) { int a[2] = {9, 9}; return a + 1; }`

In the first one, `x` belongs to the caller, whose frame stays alive for the whole call. The other two return an address inside their own frame, which is removed when they return. Moving the address with `a + 1` changes nothing.
:::

:::check id=q-lost-address lesson=malloc-and-free
What is wrong with this code?

```c
int *A = malloc(4 * sizeof(int));
A = malloc(8 * sizeof(int));
free(A);
```

- [x] The first block is never freed, because its address was overwritten
- [ ] `free(A)` frees the second block twice
- [ ] Nothing is wrong: `free(A)` frees both blocks

The second line replaces the only copy of the first block's address. Now nobody can free that block, so it is a memory leak. `free(A)` frees only the block `A` points to now.
:::

:::exercise ref=ex-reverse-copy lesson=malloc-and-free
:::

:::check id=q-what-realloc-keeps lesson=realloc-and-strings
After this code succeeds, what do you know about `B`?

```c
int *A = malloc(2 * sizeof(int));
A[0] = 1;
A[1] = 2;
int *B = realloc(A, 4 * sizeof(int));
```

- [ ] `B[0]`, `B[1]`, and `B[2]` all hold unknown values
- [ ] `B[0]` is 1, `B[1]` is 2, and `B[2]` is 0
- [x] `B[0]` is 1, `B[1]` is 2, and `B[2]` holds an unknown value

`realloc` keeps the values that were already in the block, even if it has to move them. The new room is not cleared, so it holds whatever was there before, just as with `malloc`.
:::

:::exercise ref=ex-grow-and-fill lesson=realloc-and-strings
:::

:::check id=q-who-needs-the-heap lesson=stack-or-heap
Which of these needs the heap?

- [ ] `int counts[26];`, used only inside one function
- [x] `char *line`, filled in a function and returned to its caller
- [ ] `int board[8][8];`, made in `main` and passed to other functions

The returned text must outlive the function that made it, so a local array cannot hold it. The other two stay alive as long as they are used: `board` lives until `main` ends, and functions that `main` calls can use it through a pointer.
:::

:::exercise ref=ex-heap-box lesson=stack-or-heap
:::

:::lab ref=lab-stack-limit lesson=stack-or-heap
:::
