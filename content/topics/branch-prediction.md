---
id: branch-prediction
title: Branches and branch prediction
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
  - "ps4.pdf"
---

In [How the processor overlaps instructions](topic:pipeline) you saw that a **branch**, a point where the program can go one of two ways, makes the pipeline guess. A wrong guess throws away work. This lesson shows how the processor guesses, why the **data** decides how often it is right, and what you and the compiler can do about branches that are hard to guess.

## How the processor guesses

The processor does not wait to learn which way a branch goes. It **predicts** the direction, keeps working on that path, and checks later:

1. **Predict:** pick the likely path.
2. **Run ahead:** start the instructions on that path while the test is still being worked out. Work done on a guess like this is called **speculative** work.
3. **Check:** when the test result is known, compare. If the guess was right, keep the work. If it was wrong, throw the speculative work away and start the right path. This wrong guess is a **misprediction**, and it costs a pipeline flush. How many ticks it costs depends on the processor.

There are three simple ways to guess:

- **Static prediction:** always make the same guess. For a loop, guess "go back to the top". For an `if`, guess that the condition is true.
- **Random prediction:** flip a coin.
- **Dynamic prediction:** remember what each branch did recently, and guess that it will do the same again. Modern processors do this, with clever ways to remember patterns.

Take a loop that runs 1,000 times. Its jump back to the top is taken 999 times and not taken once, at the end. Static prediction ("jump back") is wrong only once, at the very end. Dynamic prediction may be wrong the first time, while it has no history, and again at the end. Either way, about 1,000 good guesses for 1 or 2 bad ones. Loops are easy.

:::definition id=def-branch-prediction title="Branch prediction" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
**Branch prediction** is the processor guessing the direction of a branch before the test is finished, so the pipeline can keep working. A **misprediction** is a wrong guess, and it throws away the work done on the wrong path.
:::

:::check id=chk-static-loop
A loop runs 500 times, and the processor always guesses that the jump back to the top of the loop is taken. How many times does it guess wrong?

- [x] Once, after the last iteration
- [ ] 500 times
- [ ] About 250 times

The jump back is taken after iterations 1 to 499, and the guess is right each time. After iteration 500, the loop ends, so the jump is not taken, and that one guess is wrong.
:::

## The data decides

Here is a loop that writes a 9 wherever a flag is set:

```c
void update(const uint8_t *flag, uint8_t *out, int n) {
    for (int i = 0; i < n; i++) {
        if (flag[i])
            out[i] = 9;
    }
}
```

`uint8_t` is a one-byte whole number with no sign. The compiler turned `if (flag[i])` into a real branch. It was run 80 times over an array of about a million flags, about half of them 1, arranged in two ways:

- **Sorted:** all the 0s first, then all the 1s.
- **Random:** 0s and 1s mixed in no pattern.

![Two rows of flags. The sorted row is eight 0s followed by eight 1s, and the guesses are right except at the one place where 0 turns into 1. The random row mixes 0s and 1s, and the guesses are wrong about half the time. Sorted took 41.27 milliseconds and random took 306.15 milliseconds.](../assets/figures/branch-patterns.svg)

| Flags | Time |
| --- | --- |
| Sorted | 41.27 ms |
| Random | 306.15 ms |

The random run took **7.42 times as long**, with the same branch, the same number of iterations, and about the same number of writes. With sorted flags, the predictor learns "0, 0, 0, ..." and is wrong only where the 0s turn into 1s. With random flags, no history helps, so it is wrong about half the time, and each miss is a flush.

This also explains the puzzle in the last lesson: the array with a random mix of small and big values was about ten times slower than the others.

**How predictable your data is, is part of how fast your code is.** Sometimes you can sort or group the data first. But only do that when the order does not matter to the result.

:::check id=chk-sorted-faster
A loop runs `if (x[i] > 0) count++;` over a million numbers. In one run, the negative numbers all come first and the positive ones all come after. In another, the same numbers are shuffled. Which run is likely faster, and why?

- [x] The first, because the branch goes the same way for long stretches, so the guesses are almost always right
- [ ] The second, because shuffled data spreads the work evenly
- [ ] Neither, because both runs do the same number of comparisons

Both do the same work. But in the first run the processor's guesses are right nearly every time, and in the second it often guesses wrong and must throw away work.
:::

## Choosing a value without jumping

A branch is not the only way to choose between two things. Many processors have a **conditional move** instruction: it computes **both** possible values and then picks one, depending on a test, with no jump at all. On x86 processors it is called `cmov`. With no jump, there is nothing to guess, so nothing to mispredict. The price is that the work for both choices is done every time.

Look at this loop over random 32-bit numbers. It adds `a[i]` to `b[i]` when `a[i]` is in the upper half of its range, and subtracts it otherwise:

```c
void update_if(const uint32_t *a, uint32_t *b, size_t n) {
    for (size_t i = 0; i < n; ++i) {
        if (a[i] > UINT32_MAX / 2)
            b[i] += a[i];
        else
            b[i] -= a[i];
    }
}
```

With random input, the test is true about half the time in no pattern, so a branch here would be hard to predict.

Here is a rewrite that gives the same result:

```c
void update_ternary(const uint32_t *a, uint32_t *b, size_t n) {
    for (size_t i = 0; i < n; ++i)
        b[i] += (a[i] > UINT32_MAX / 2) ? a[i] : -a[i];
}
```

The `? :` is the **conditional operator**: `test ? first : second` gives `first` when the test is true, and `second` otherwise.

Why is it the same? `-a[i]` on an unsigned number wraps around: for a `uint32_t`, it is 2³² − `a[i]`. Adding that to `b[i]` wraps around again, and gives exactly `b[i] − a[i]`. So both versions do the same arithmetic.

The rewrite does two things. It writes `b[i] +=` once instead of twice, and it turns the choice into a choice of **one value**. Built with `-O1`, the first version kept a branch, and the second became a conditional move:

```text
; if-else version: a jump          ; ternary version: no jump
mov  r8d, [rdi + rax*4]           mov   r8d, [rdi + rax*4]
test r8d, r8d                     mov   ecx, r8d
js   .Ladd    ; jump if top bit   neg   ecx          ; ecx = -a[i]
...           ; subtract path     cmovs ecx, r8d     ; pick a[i] if top bit
.Ladd:                            sub   [rsi + rax*4], ecx
...           ; add path          ; no jump depends on the data
```

(`a[i] > UINT32_MAX / 2` is true exactly when the top bit of `a[i]` is 1, so the compiler tests that bit.)

The measurement, over about a million elements, 120 passes:

| Build | `if`-`else` | Conditional value |
| --- | --- | --- |
| `-O1` | 605.5 ms (a jump) | 88.8 ms (`cmovs`) |
| `-O2` | 92.0 ms (`cmovs`) | 90.1 ms (`cmovs`) |

At `-O1`, the rewrite was **6.82 times faster**. At `-O2`, the compiler found the conditional move for the original `if`-`else` by itself, and the two versions are the same speed.

:::trap
Thinking that `? :` is always faster than `if`. It promises nothing about the machine code. Writing `b[i] = test ? b[i] + a[i] : b[i] - a[i];` is just the `if`-`else` in other punctuation, and at `-O1` it still compiled to a jump. And GCC also kept a jump for `out[i] = flag[i] ? 9 : out[i];`. The compiler optimizes the work you describe, not the symbols you use. Check the machine code, and measure.
:::

:::check id=chk-ternary-magic
A loop chooses between two values with `if`-`else`. You rewrite it with `? :`, without changing anything else, and build with `-O2`. What should you expect?

- [ ] It will be faster, because `? :` never uses a jump
- [x] It may run exactly the same, because the compiler decides on the machine code, not the punctuation
- [ ] It will be slower, because `? :` always computes both values

`? :` is only a way of writing a choice. At `-O2` the compiler may already use a conditional move for the `if`-`else`, or it may keep a jump for the `? :`. Look at the machine code, or measure.
:::

## When a conditional move is a bad idea

A conditional move does the work of **both** choices. That is fine when both are cheap, like `a[i]` and `-a[i]`. It is wrong in three cases:

- **Expensive work.** In `val = test(x) ? hard1(x) : hard2(x);`, a conditional move would run both slow functions. A branch runs only one.
- **Risky work.** In `val = p ? *p : 0;`, computing `*p` before checking `p` would follow a `NULL` pointer and crash. The second value may only be computed when it is safe.
- **Work that changes something.** In `val = x > 0 ? (x *= 7) : (x += 3);`, each choice changes `x`. Doing both would change `x` twice. A conditional move needs work with no **side effects**, meaning no changes to anything outside it.

The compiler checks these rules before it uses a conditional move. It never computes a value early when that could crash or change something.

:::check id=chk-cmov-risky
Why can the compiler not use a conditional move, which computes both values, for `val = (p != NULL) ? *p : 0;`?

- [ ] Because `0` is a constant
- [x] Because computing `*p` when `p` is `NULL` would crash the program
- [ ] Because pointers cannot be moved

A conditional move computes both values first and then picks one. Here one of the values reads memory through `p`, which is only safe after the test has shown that `p` is not `NULL`.
:::

## A test that never changes

Sometimes the test inside a loop has the same answer on every iteration:

```c
for (int i = 1; i < n - 1; i++) {
    if (mode == 1)
        y[i] = (x[i - 1] + 2 * x[i] + x[i + 1]) / 4;
    else
        y[i] = x[i] - x[i - 1];
}
```

`mode` never changes inside the loop, so you can test it once, outside, and write two simple loops:

```c
if (mode == 1) {
    for (int i = 1; i < n - 1; i++)
        y[i] = (x[i - 1] + 2 * x[i] + x[i + 1]) / 4;
} else {
    for (int i = 1; i < n - 1; i++)
        y[i] = x[i] - x[i - 1];
}
```

This removes a branch from every iteration and leaves each loop small and simple, which also helps the compiler. GCC can do this itself at `-O3`, but writing it yourself makes sure it happens.

## Before you change a branch

There is no single recipe that turns every `if` into faster code. A good order is:

1. First check that the branch is really a problem: look at the machine code, or ask a profiler how often branches are mispredicted.
2. If a test never changes inside a loop, move it outside.
3. Tricks that compute a value with arithmetic instead of a test remove the branch, but add instructions.
4. Writing only when a test is true can be cheaper than writing every time.
5. Always measure on realistic data, because sorted test data can hide a problem that random real data shows.

## Letting real runs guide the compiler

When the compiler builds a branch, it does not know which way it usually goes. It has to guess from the code. **Profile-guided optimization** (PGO) gives it real numbers. It works in three steps:

```bash
gcc -O2 -fprofile-generate my_code.c -o app    # 1. a build that counts
./app < representative_input.dat               # 2. run it on typical input
gcc -O2 -fprofile-use my_code.c -o app         # 3. build again, using the counts
```

1. The first build adds counters to the program, so it records how often each branch goes each way and each function is called. This build is bigger and slower, and is only for collecting numbers.
2. You run it on input that looks like real use. It writes the counts to files ending in `.gcda`.
3. The second build reads those counts. Now the compiler knows, for example, that one side of an `if` runs 99% of the time. It places that common path so it runs straight through, moves the rare path out of the way, and spends inlining on the code that runs most.

:::trap
Training PGO on input that does not look like real use. The compiler then speeds up paths that are rare in practice, which can make the real program **slower**. The counts are only as good as the input that made them.
:::

## Practice

:::problem id=prac-predict-the-pattern title="Will the guess be right?" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
A processor remembers what a branch did last time and guesses it will do the same again. Each line gives the directions a branch takes, in order (T for taken, N for not taken).

:::check id=prac-predict-the-pattern-q1
For T T T T T T N N N N N N, its guesses are wrong {{=about 2 times|about 6 times|about 12 times}}.

It may be wrong on the first one, before it has any history, and on the change from T to N. Every other guess repeats the last direction, which is right.
:::

:::check id=prac-predict-the-pattern-q2
For T N T N T N T N, guessing "same as last time" is wrong {{=almost every time|about half the time|never}}.

The direction changes on every step, so repeating the last one is always the wrong guess. Real processors also remember longer patterns and can learn this one, but a random sequence defeats them all.
:::
:::

:::problem id=prac-branch-or-cmov title="Branch or conditional move?" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=source
For each choice, decide whether computing both values and picking one is safe and sensible.

:::check id=prac-branch-or-cmov-q1
`m = (a > b) ? a : b;` with two `int`s is {{=a good fit for a conditional move|unsafe for a conditional move|too expensive for a conditional move}}.

Both values are already in hand and cost nothing to compute, and nothing changes. This is the ideal case.
:::

:::check id=prac-branch-or-cmov-q2
`v = ok ? slow_lookup(k) : slow_build(k);` is {{=too expensive for a conditional move|a good fit for a conditional move|unsafe for a conditional move}}.

A conditional move would run both slow functions every time. A branch runs only one.
:::

:::check id=prac-branch-or-cmov-q3
`v = (i < n) ? arr[i] : 0;` is {{=unsafe for a conditional move|a good fit for a conditional move|too expensive for a conditional move}}.

When `i` is not less than `n`, `arr[i]` is past the end of the array. Reading it before the test could crash the program, so it may only be read after the test.
:::
:::

**Next:** some rewrites look obvious to you, but the compiler is not allowed to make them. The next lesson shows why, and how to give it permission.
