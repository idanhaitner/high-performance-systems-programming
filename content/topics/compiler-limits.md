---
id: compiler-limits
title: "What the compiler cannot do: hidden effects and aliasing"
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
---

In [What the compiler does for you](topic:compiler-optimizations) you saw the compiler rewrite code in clever ways. But it follows one strict rule: **the program must do exactly what you wrote, in every possible case.** If a rewrite would be wrong in even one rare case, the compiler may not make it, even if that case never happens in your program. This lesson shows two common situations where that rule blocks an obvious speed-up, and how you can help.

## A function call inside a loop test

This function changes capital letters in a string into small letters:

```c
void lower(char *s) {
    for (int i = 0; i < strlen(s); i++)
        if (s[i] >= 'A' && s[i] <= 'Z')
            s[i] -= ('A' - 'a');
}
```

`'A' - 'a'` is the distance between a capital letter and its small letter in the character table, so subtracting it turns `'A'` into `'a'`.

Look at the loop test, `i < strlen(s)`. It runs before **every** iteration, and `strlen` counts the letters by walking the whole string until it finds the `'\0'` at the end. For a string of `n` letters, the loop calls `strlen` about `n` times, and each call walks `n` letters. That is about `n × n` steps for a job that needs only `n`. For a string of 100,000 letters, that is ten billion steps instead of a hundred thousand.

The fix is to measure the length once, before the loop:

```c
void lower(char *s) {
    size_t len = strlen(s);
    for (size_t i = 0; i < len; i++)
        if (s[i] >= 'A' && s[i] <= 'Z')
            s[i] -= ('A' - 'a');
}
```

Why doesn't the compiler do this by itself? To move the call out of the loop, it must be sure that the answer of `strlen(s)` is the same on every iteration. Two things stand in the way:

- **A function call may have side effects.** A **side effect** is any change a function makes outside itself: writing to a global variable, printing, changing memory through a pointer. For a function it cannot see inside, the compiler must assume that each call might do something, so it must make every call, as many times as the code says.
- **The loop writes into the string.** The loop body changes `s[i]`. In general, a write into the string could change where the `'\0'` is, and so change the length. The compiler would have to prove that it does not.

You know the length never changes here, because the loop only turns one letter into another letter. The compiler does not know that, so you make the change yourself.

:::check id=chk-strlen-cost
A loop is `for (int i = 0; i < strlen(s); i++)` over a string of 1,000 letters, and `strlen` reads every letter each time it is called. About how many letters do all the `strlen` calls read together?

- [ ] About 1,000
- [ ] About 2,000
- [x] About 1,000,000

The test runs about 1,000 times, and each call reads about 1,000 letters, so about 1,000 × 1,000 = 1,000,000. Calling `strlen` once before the loop reads only 1,000.
:::

## Two pointers to the same place

Here is a tiny function:

```c
void f(int *x, int *y) {
    *x += *y;
    *x += *y;
}
```

It adds `*y` to `*x` twice. Surely this does the same, with one fewer step?

```c
void g(int *x, int *y) {
    *x += 2 * (*y);
}
```

Try both with the **same** pointer for `x` and `y`. Let `int a = 5;` and call `f(&a, &a)`:

1. `*x += *y` makes `a` = 5 + 5 = 10.
2. `*x += *y` reads `*y`, which is `a`, now 10. So `a` = 10 + 10 = **20**.

Now `g(&a, &a)` with `a = 5`:

1. `*x += 2 * (*y)` makes `a` = 5 + 2 × 5 = **15**.

Different answers. In `f`, the first line changed `*y` too, because `x` and `y` point to the same `int`. Two pointers that may point to the same memory are said to **alias** each other, and this is called **aliasing**. Since `f` might be called with the same pointer twice, the compiler may not turn `f` into `g`.

:::definition id=def-aliasing title="Aliasing" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
Two pointers **alias** when they point to the same memory, or to overlapping memory. A write through one of them can then change what the other one reads.
:::

:::check id=chk-alias-trace
`void h(int *x, int *y) { *x = 1; *y = 2; printf("%d\n", *x); }` is called as `h(&a, &a)`. What does it print?

- [ ] 1
- [x] 2
- [ ] It does not compile

`x` and `y` both point to `a`. `*x = 1` sets `a` to 1, then `*y = 2` sets the same `a` to 2. So `*x` is 2. Because of this, the compiler cannot just print 1 without reading `*x` again.
:::

## Aliasing in a loop

Aliasing often blocks speed-ups in loops. This function adds the first number of `b` to every number of `a`:

```c
void update(int n, float *a, const float *b) {
    for (int i = 0; i < n; i++)
        a[i] += b[0];
}
```

It looks as if `b[0]` could be read once, before the loop, and kept in a register. But what if `b` points into `a`? Say `b == &a[3]`. Then the write to `a[3]` in the fourth iteration changes `b[0]`, and every later iteration must add the **new** value. Reading `b[0]` once would change the answer.

The `const` in `const float *b` does not help. It only means that **this function** will not write through `b`. It does not promise that nobody else changes that memory.

So the compiler must read `b[0]` from memory again in every iteration, just in case.

## `restrict`: a promise to the compiler

C has a word for telling the compiler that this cannot happen. Putting `restrict` after the `*` of a pointer parameter says: **for as long as this function runs, the memory this pointer reaches is reached only through this pointer.** The others do not overlap it.

```c
void update(int n, float * restrict a, const float * restrict b) {
    for (int i = 0; i < n; i++)
        a[i] += b[0];
}
```

Now a write through `a` cannot change what `b` reads, so the compiler is allowed to read `b[0]` once and keep it in a register. `restrict` does not change what the code does. It only gives the compiler permission for more rewrites.

The promise is yours to keep. The compiler does not check it. If someone calls this `update` with `b` pointing into `a`, the behavior is **undefined**: the program may give any answer at all.

Some standard library functions use this promise. `memcpy`, which copies bytes, says that its two blocks must not overlap. `memmove` makes no such promise, and works even when they overlap.

:::trap
Adding `restrict` to make a function faster, and then calling it with overlapping pointers. The program may give wrong answers, and only sometimes, depending on the build options. Only add `restrict` when every caller really passes separate memory.
:::

:::check id=chk-restrict-meaning
A function is declared `void scale(int n, float * restrict out, const float * restrict in)`. What does `restrict` mean here?

- [ ] The function makes a copy of `in` so it is safe to overlap
- [x] The caller promises that `out` and `in` do not reach the same memory while the function runs
- [ ] The compiler checks at run time that the pointers do not overlap

`restrict` is a promise, and the compiler trusts it without checking. With that promise, it may keep values in registers instead of reading them again after each write.
:::

## You often know more than the compiler

Both stories in this lesson have the same shape. You know a fact about your program, such as "the length never changes" or "these arrays are separate". The compiler cannot prove that fact from the code alone, so it plays safe. You can help in two ways:

- **Do the change yourself**, as with `strlen`: compute something once and keep it in a local variable.
- **State the fact**, as with `restrict`.

Copying a value into a local variable is often the simplest of all. A local variable whose address is never taken cannot alias anything, so the compiler is free to keep it in a register.

## Practice

:::problem id=prac-alias-results title="Same pointer twice" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=source
`f` is `void f(int *x, int *y) { *x += *y; *x += *y; }`, and `g` is `void g(int *x, int *y) { *x += 2 * (*y); }`.

:::check id=prac-alias-results-q1
With `int a = 3, b = 4;`, after `f(&a, &b)`, `a` is {{=11|10|7}}.

`a` and `b` are separate. `a` becomes 3 + 4 = 7, then 7 + 4 = 11.
:::

:::check id=prac-alias-results-q2
With `int a = 3;`, after `f(&a, &a)`, `a` is {{=12|9|6}}.

The first line makes `a` = 3 + 3 = 6. The second reads the new `a`: 6 + 6 = 12. In general, `f(&a, &a)` multiplies `a` by 4.
:::

:::check id=prac-alias-results-q3
With `int a = 3;`, after `g(&a, &a)`, `a` is {{=9|12|6}}.

3 + 2 × 3 = 9. `g` multiplies `a` by 3 here, while `f` multiplies it by 4. That one case is why the compiler may not turn `f` into `g`.
:::
:::

:::problem id=prac-hoist-or-not title="Can it be read once?" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
`void update(int n, float *a, const float *b) { for (int i = 0; i < n; i++) a[i] += b[0]; }`

:::check id=prac-hoist-or-not-q1
Without `restrict`, the compiler must read `b[0]` {{=in every iteration|once, before the loop|never}}.

A write to some `a[i]` might change `b[0]`, if `b` points into `a`. So it must read it again each time.
:::

:::check id=prac-hoist-or-not-q2
If `a` has 10 numbers, all 1, and the call is `update(10, a, &a[2])`, then afterwards `a[5]` is {{=3|2|11}}.

In iterations 0 and 1, `b[0]` is `a[2]`, which is 1. In iteration 2, `a[2]` becomes 1 + 1 = 2. From then on `b[0]` is 2, so `a[5]` becomes 1 + 2 = 3.
:::

:::check id=prac-hoist-or-not-q3
With `restrict` on both pointers, calling `update(10, a, &a[2])` is {{=undefined behavior|safe and gives the same result|a compile error}}.

The call breaks the promise that `a` and `b` do not overlap. The compiler does not check it, so the program may give any answer.
:::
:::

**Next:** the pipeline needs independent work to stay busy. The next lesson shows two ways to give it more: doing several iterations at once, and splitting one long chain of additions into several short ones.
