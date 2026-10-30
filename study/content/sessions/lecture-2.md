---
id: lecture-2
lecture: lecture-2
title: "Lecture 2 practice: memory management"
---

:::learn title="How this practice works"
You have read the lessons, so now you use them. Each lesson gets one new question, and most get a small coding exercise. One lab, done on your own computer in VS Code (a free code editor), comes last.

Press **Next** when a step is done. If you are stuck, press **Skip for now**, or use the **Reread** link at the top of the step to open that step's lesson.

In a coding exercise, comments marked `TODO` show the part left for you. **Run** shows what your code prints. **Test my code** checks it against small test cases, and all of them must pass. **Show assembly** shows the machine instructions the compiler made; it is there if you are curious. If you get stuck, **Show hint** opens one hint at a time, and **Show solution** appears after two Test runs that do not pass.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press one of these buttons.
:::

:::check id=q-copy-of-the-pointer lesson=pointers-to-pointers
What does this print?

```c
void aim(int *q, int *target) {
    q = target;
}

int main(void) {
    int a = 1, b = 2;
    int *p = &a;
    aim(p, &b);
    *p = 7;
    printf("%d %d\n", a, b);
}
```

- [ ] `1 7`
- [x] `7 2`
- [ ] `7 7`

`q` is only a copy of `p`, so changing `q` leaves `p` pointing at `a`. Then `*p = 7` changes `a`. To change `p` itself, `aim` would need a pointer to `p`, an `int **`.
:::

:::exercise ref=ex-point-to-max lesson=pointers-to-pointers
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

:::exercise ref=ex-find-first lesson=pointer-arithmetic
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

:::exercise ref=ex-copy-text lesson=realloc-and-strings
:::

:::exercise ref=ex-append lesson=realloc-and-strings
:::

:::check id=q-who-needs-the-heap lesson=stack-or-heap
Which of these really needs the heap?

- [ ] A small array of 3 `int`s that one function uses and then forgets
- [ ] A loop counter
- [x] A list of names that keeps growing as the user types, and other functions still read it after the function that made it has returned

The list needs the heap for two reasons: its size changes while the program runs, and it must outlive the function that made it. The other two are small, fixed in size, and short-lived, so the stack suits them better.
:::

:::lab ref=lab-stack-limit lesson=stack-or-heap
:::
