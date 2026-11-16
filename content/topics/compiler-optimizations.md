---
id: compiler-optimizations
title: What the compiler does for you
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
  - "ps4.pdf"
---

In [Measure before you optimize](topic:measure-first) you learned to find the slow part of a program and to time it fairly. Before you rewrite that part by hand, it helps to know that the compiler already rewrites your code. This lesson shows what an optimizing compiler does, how you ask for more or less of it, and why you cannot judge speed just by looking at the C code.

## The compiler rewrites your code

When `gcc` turns C into machine instructions, it does not have to copy your code word for word. It only has to keep what the program **does**: the same output, the same values written to memory that others can see. Inside those limits, it may change anything. Making the program faster this way is called **optimization**.

Here are three common rewrites.

**Constant folding: doing the math in advance.**

```c
int seconds = 60 * 60 * 24;
int bytes = 1024 * 1024;
```

These numbers never change, so the compiler works them out while compiling. The program simply stores 86400 and 1048576, with no multiplication when it runs.

**Dead code elimination: removing work nobody uses.**

```c
int calculate(int x) {
    int a = x * 2;   /* a is never used */
    int b = x + 5;
    return b;
}
```

`a` does not affect the result, so the compiler drops that line. The function becomes `return x + 5;`. You saw this rewrite in the last lesson, where it deleted a whole benchmark loop.

**Inlining: pasting a small function where it is called.**

```c
static inline int add(int a, int b) {
    return a + b;
}

int x = add(5, 3);
```

Calling a function costs a few instructions: jump to it, set up its stack frame, jump back. For a tiny function, that costs more than the work itself. So the compiler may paste the body of `add` into the caller, which gives `int x = 5 + 3;`, and then constant folding turns that into `int x = 8;`.

These are only examples. The compiler decides which rewrites to use, based on your code and on the options you give it.

:::check id=chk-dead-line
A function is `int f(int x) { int a = x * x; int b = x - 1; return b; }`. What can an optimizing compiler turn it into, without changing what it does?

- [x] `int f(int x) { return x - 1; }`
- [ ] `int f(int x) { return x * x; }`
- [ ] Nothing, because every line must run as written

`a` is computed and then never used, so removing it cannot change the result. That is dead code elimination.
:::

## Optimization levels

You choose how hard `gcc` tries with an option that starts with `-O`, a capital letter O:

| Option | What it does | When to use it |
| --- | --- | --- |
| `-O0` | Almost no optimization. Compiles fast, and the machine code follows your C closely. | While writing and debugging |
| `-O1` | Basic, cheap optimizations | Big projects that must compile quickly |
| `-O2` | Most optimizations that do not trade size for speed | The usual choice for the finished program |
| `-O3` | More aggressive rewrites, such as unrolling loops | Heavy number crunching, after measuring |
| `-Os` | Prefer small machine code | When program size matters |

```bash
gcc -O0 demo.c -o demo_O0
gcc -O2 demo.c -o demo_O2
gcc -O3 demo.c -o demo_O3
```

Here is one measurement. A loop ran one billion times, each time multiplying and adding into a number `x` and adding `x` into a total. Each iteration needed the `x` from the iteration before. The same source file, built three ways, took:

| Build | Time |
| --- | --- |
| `-O0` | 2.338 s |
| `-O2` | 1.316 s |
| `-O3` | 1.314 s |

Going from `-O0` to `-O2` made it **1.78 times faster**, without changing one line of C. `-O3` gave nothing more here. A difference of 0.002 seconds from a single run is noise, not a real gain.

**Is `-O3` always the fastest?** No. Its rewrites can make the machine code bigger. Machine instructions are also kept in a cache, and bigger code can fit less well in it. Whether `-O3` helps depends on the code, the processor, and the compiler, so measure it.

:::trap
Timing code built with `-O0`. That build keeps every value in memory and runs every step as written, so it is slow in ways the real program is not. Measure with the options the real program uses, usually `-O2`.
:::

:::check id=chk-o3-faster
A program built with `-O3` instead of `-O2` is always at least as fast. True or false?

- [ ] True, because `-O3` turns on more optimizations
- [x] False, because the extra rewrites can make the code bigger and sometimes slower
- [ ] True, but only for programs with loops

`-O3` does more, but more is not always better. For example, copying a loop body many times makes the program bigger. Measure both on your real data.
:::

## You cannot judge speed by the C code alone

Which of these two loops is faster?

```c
/* Version A */
for (int i = 0; i < N; i++)
    result += arr[i] * 6;

/* Version B */
for (int i = 0; i < N; i++)
    result += arr[i] + arr[i] + arr[i] + arr[i] + arr[i] + arr[i];
```

Version B looks like more work: five additions instead of one multiplication. But both compute exactly the same value, and an optimizing compiler can see that. It may turn both into the very same machine instructions. Then they run at the same speed.

Here is a second pair. Both add up an array:

```c
/* Fixed start, moving index */
uint64_t index_sum(const uint32_t *a, size_t n) {
    uint64_t sum = 0;
    for (size_t i = 0; i < n; ++i)
        sum += a[i];
    return sum;
}

/* Moving pointer */
uint64_t pointer_sum(const uint32_t *a, size_t n) {
    uint64_t sum = 0;
    const uint32_t *p = a;
    const uint32_t *end = a + n;
    while (p < end)
        sum += *p++;
    return sum;
}
```

Some people believe the moving pointer is faster, because it does not compute `a + i` each time. With `-O2`, the compiler turns `a[i]` into a moving pointer by itself. The two inner loops became the same five instructions, except for the kind of jump at the end. On an array of 8 million numbers, they took 2.97 ms and 2.96 ms: less than 1% apart. Even at `-O0`, the gap was only about 3%.

Both loops also read memory in the same order, so neither one uses the cache better.

The lesson: **performance must be measured, not guessed.** Write the clearer version, and change it only if a measurement shows a real difference.

:::check id=chk-index-or-pointer
Two functions add up the same array. One uses `a[i]` with a counter, and the other moves a pointer `p` through the array with `*p++`. Built with `-O2`, what do you expect?

- [ ] The pointer version is about twice as fast
- [x] About the same speed, because the compiler makes nearly the same instructions for both
- [ ] The counter version is about twice as fast

The optimizer rewrites `a[i]` into a moving pointer by itself, and both loops read the same addresses in the same order. Measured, they were less than 1% apart.
:::

## Building for your own processor: `-march=native`

Processors from the same family share a basic set of instructions, but newer ones add extra instructions. By default, `gcc` uses only the basic set, so your program runs on any processor of that family.

The option `-march=native` tells `gcc` to use every instruction **your** processor has:

```bash
gcc -O2 -march=native program.c -o app
```

That can make the program faster on your machine, though it is not guaranteed. But the program may then **fail on an older processor**, which stops it with an "Illegal instruction" error. Use it for programs that run only on the machine that built them.

## Practice

:::problem id=prac-what-the-compiler-did title="What did the compiler do?" source="ps4.pdf" kind=exercise solution_origin=source
Each line describes code before and after `gcc -O2` changed it. Name the rewrite.

:::check id=prac-what-the-compiler-did-q1
`int bytes = 1024 * 1024;` became `int bytes = 1048576;`. This is {{=constant folding|inlining|dead code elimination}}.

The product of two fixed numbers was worked out while compiling.
:::

:::check id=prac-what-the-compiler-did-q2
A call `int x = add(5, 3);` became `int x = 5 + 3;`. This is {{=inlining|constant folding|dead code elimination}}.

The body of the small function `add` was pasted where it was called, which saves the cost of the call.
:::

:::check id=prac-what-the-compiler-did-q3
A loop that added numbers into `sum` disappeared, because `sum` was never used. This is {{=dead code elimination|inlining|constant folding}}.

The loop had no effect anyone could see, so the compiler removed it.
:::
:::

:::problem id=prac-flag-speedup title="Reading the effect of a flag" source="ps4.pdf" kind=exercise solution_origin=source
A program took 2.338 seconds when built with `-O0`, 1.316 seconds with `-O2`, and 1.314 seconds with `-O3`. Each build ran once.

:::check id=prac-flag-speedup-q1
The `-O2` build is about {{=1.78|1.31|2.34}} times as fast as the `-O0` build.

2.338 / 1.316 is about 1.78.
:::

:::check id=prac-flag-speedup-q2
From these numbers, `-O3` {{=has no meaningful advantage over -O2|is clearly faster than -O2|is clearly slower than -O2}}.

0.002 seconds out of 1.3, from a single run each, is well inside the noise of a measurement. You would need several runs to claim any difference.
:::
:::

**Next:** to know why some code is fast and other code is slow, you need a picture of how the processor runs instructions. The next lesson shows that it works on several at once.
