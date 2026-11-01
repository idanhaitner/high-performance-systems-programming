---
id: lecture-2
lecture: lecture-2
title: "Lecture 2 practice: memory management"
---

:::learn title="How this practice works"
You have read the lessons, so now you use them. Each lesson gets one new question and a very small code question where you write just a few lines, and most also get a bigger coding exercise. One lab, done on your own computer in VS Code (a free code editor), comes last. It ends with a final exercise that uses everything from these lessons.

Press **Next** when a step is done. If you are stuck, press **Skip for now**, or use the **Reread** link at the top of the step to open that step's lesson.

A coding exercise gives you the function's first line, and the panel on the left says what it must do. You write the rest on the right. **Run** shows what your code prints. **Submit** checks it against small test cases, and all of them must pass. Your code is tidied by itself each time you press either one. Pressing Ctrl+S (Cmd+S on a Mac) does the same as **Run**. The **Assembly** tab shows the machine instructions the compiler made; it is there if you are curious. If you get stuck, **Hints** opens one hint at a time, and **Solution** shows a finished answer. Try the exercise first, because you learn more that way. To move out of the editor with the keyboard, press Esc and then Tab.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press one of these buttons.
:::

:::check id=q-cast-then-compare lesson=casting
What does this print?

```c
int a = 300;
uint8_t b = (uint8_t)a;
if (b == a)
    printf("same\n");
else
    printf("%d\n", b);
```

- [x] `44`
- [ ] `same`
- [ ] `255`

The cast keeps only the last byte of 300, so `b` is 44. In the comparison, `b` is turned back into an `int`, but the lost bits do not return, so 44 does not equal 300. A cast never stops at the largest value, so the answer is not 255.
:::

:::exercise ref=ex-low-byte lesson=casting
:::

:::exercise ref=ex-fits-in-byte lesson=casting
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

:::exercise ref=ex-clear-pointer lesson=pointers-to-pointers
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

:::exercise ref=ex-last-element lesson=pointer-arithmetic
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

:::exercise ref=ex-apply lesson=function-pointers
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

:::exercise ref=ex-fill-callers-array lesson=stack-frames
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

:::exercise ref=ex-make-zeros lesson=malloc-and-free
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

:::exercise ref=ex-copy-text lesson=realloc-and-strings
:::

:::exercise ref=ex-append lesson=realloc-and-strings
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

:::check id=q-struct-block lesson=structures-on-the-heap
What does this print?

```c
typedef struct {
    int id;
    int grade;
} Student;

Student *s = calloc(3, sizeof(*s));
s[1].grade = 90;
s->grade = 70;
printf("%d %d %d\n", s[0].grade, s[1].grade, s[2].grade);
free(s);
```

- [x] `70 90 0`
- [ ] `90 70 0`
- [ ] `0 90 70`

`s[1]` is the second student. `s->grade` is the same as `s[0].grade`, the first student. `calloc` set every byte to 0, so the third grade is still 0.
:::

:::exercise ref=ex-new-point lesson=structures-on-the-heap
:::

:::exercise ref=ex-make-roster lesson=structures-on-the-heap
:::

:::check id=q-no-symbols lesson=debugging-tools
You build with `gcc main.c -o main` and start `gdb ./main`. Typing `break 12` answers `No symbol table is loaded`. What is the fix?

- [x] Build again with `gcc -g main.c -o main`
- [ ] Type `run` first, and then `break 12`
- [ ] Use `next` instead of `break`

Without `-g`, the program file does not record your line numbers and variable names, so GDB cannot tell what line 12 means. Running the program first does not add that information.
:::

:::exercise ref=ex-safe-copy lesson=debugging-tools
:::

:::lab ref=lab-stack-limit lesson=stack-or-heap
:::
