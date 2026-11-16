---
id: measure-first
title: Measure before you optimize
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
  - "ps4.pdf"
---

In Lecture 3 you saw that the same work can run several times faster when it reads memory in a friendlier order. This lecture is about making code faster in general: helping the compiler, the processor, and the memory do less work. But before you change a single line, you need to know **where the time goes**. This lesson shows how to find out, and how to time code honestly.

## Fix the slow part, not a random part

Picture a program with three steps:

```c
int main(void) {
    load_data();        /* read the input file into memory */
    analyze_records();  /* do the real work on the data */
    save_results();     /* write the answers to a file */
    return 0;
}
```

Which function should you make faster? You cannot tell by reading it. A short function can be slow, and a long one can be quick. You need numbers.

Suppose you measure and find this split of the running time:

| Function | Share of the time |
| --- | --- |
| `load_data` | 15% |
| `analyze_records` | 75% |
| `save_results` | 10% |

The part of a program that limits its total speed is called the **bottleneck**, like the narrow neck of a bottle that limits how fast water pours out. Here the bottleneck is `analyze_records`.

Now see what happens if you work hard on the wrong part. Say the whole program takes 100 seconds, and you make `save_results` **ten times** faster. It took 10 seconds, so now it takes 1 second. The total drops from 100 to 91 seconds: only **9% faster**, for a tenfold improvement. The other 90 seconds did not change at all.

The rule behind this is simple: **the time you can save is at most the time that part takes.** A part that is 10% of the time can never save more than 10%, however fast you make it.

:::definition id=def-bottleneck title="Bottleneck" source="ps4.pdf"
A **bottleneck** is the part of a program that uses most of the time, so it limits the speed of the whole program. Speeding up any other part helps much less.
:::

:::check id=chk-ten-times-faster
A program takes 100 seconds. One function takes 20 of those seconds, and you make that function 4 times faster. How long does the program take now?

- [ ] 25 seconds
- [x] 85 seconds
- [ ] 80 seconds

The function took 20 seconds and now takes 20 / 4 = 5 seconds, a saving of 15 seconds. The other 80 seconds did not change, so the total is 80 + 5 = 85 seconds.
:::

## A profiler shows where the time goes

A **profiler** is a tool that runs your program and reports how much of the time each function used. Most profilers work by **sampling**: many times per second, they pause the program for a moment, note which function it is in, and let it continue. If 750 out of 1,000 samples landed in `analyze_records`, that function used about 75% of the time.

Sampling gives an estimate, not an exact number, but with thousands of samples the estimate is close.

On Linux, a common profiler is **perf**. It is part of the Linux system, not part of the compiler. It reads counters that the processor itself keeps, such as how many clock ticks have passed. You use it in three steps:

```bash
gcc -O2 -g program.c -o program
perf record -g ./program
perf report
```

1. Build with `-O2`, so you measure the fast version that people really use, and with `-g`, which keeps the names of your functions in the program so the report can show them.
2. `perf record` runs the program and collects samples into a file.
3. `perf report` shows the result, with the busiest function first:

```text
# Overhead  Command  Shared Object  Symbol
    74.82%  program  program        [.] analyze_records
    14.95%  program  program        [.] load_data
    10.23%  program  program        [.] save_results
```

The "Overhead" column is the share of samples. Now you know where to start.

:::check id=chk-sampling
A sampling profiler pauses a program 2,000 times while it runs. 1,500 of those pauses land in the function `parse`. About how much of the running time did `parse` use?

- [ ] 1,500 milliseconds
- [x] About 75%
- [ ] Exactly 75%, with no error

1,500 out of 2,000 is 75%. It is an estimate, because the profiler only looks at the program now and then. With many samples, the estimate is close to the true share.
:::

## The optimization cycle

Speeding up a program is a loop of four steps:

1. **Write** correct, clear code first. Fast code that gives the wrong answer is worth nothing.
2. **Profile** it to find the bottleneck.
3. **Optimize** only that part.
4. **Measure** again to check that the change really helped. If you still need more speed, go back to step 2.

A famous saying by the computer scientist Donald Knuth sums this up: "Premature optimization is the root of all evil." Making code faster **before** you know where the time goes usually makes it harder to read, and often speeds up a part that did not matter.

## Timing code honestly

When you compare two versions of a function, a careless measurement can fool you. A fair comparison, called a **benchmark**, follows a few rules:

- **Same input.** Both versions get exactly the same data. Data can change the speed, as you will see in the lesson about branches.
- **Same build settings.** Compile both with the same compiler and the same options. Measure with the options that the real program uses, usually `-O2`.
- **Several runs.** A computer runs many things at once, so one run can be slow by chance. Run each version several times, for example 5 or 9, and report the **median**: the middle value after sorting. One unlucky run cannot move the median much.
- **Check the answer.** Each version must still give the right result. A "faster" version that is wrong is not faster.

For example, five runs of one version took 12, 11, 30, 12, and 13 milliseconds. Sorted, they are 11, 12, 12, 13, 30, so the median is **12 ms**. The 30 was a run where something else slowed the computer. The average would be 15.6 ms, pulled up by that one bad run.

:::trap
Comparing one run of version A with one run of version B. The difference you see may be pure chance. Run each several times, and compare the medians.
:::

## The compiler may delete your benchmark

Here is a surprise. You want to time how long it takes to add up a million numbers:

```c
uint64_t sum = 0;
for (int i = 0; i < 1000000; i++)
    sum += data[i];
/* sum is never used after this */
```

With `-O2`, the timer may say this took almost no time. The reason: the compiler noticed that `sum` is never printed, returned, or used in any way. Removing the loop cannot change what the program does, so the compiler removes it. This is called **dead code elimination**, and it is a normal and useful optimization. Here it ruins the measurement.

The fix is to **use the result** in a way that the program shows, for example by printing it:

```c
printf("Sum: %llu\n", (unsigned long long)sum);
```

Now the loop affects the output, so the compiler must keep it. It may still make the loop faster in other ways, and that is fine: you want to measure the fast version.

:::check id=chk-vanishing-loop
A benchmark times a loop that adds a million numbers into `total`, but `total` is never used afterwards. Built with `-O2`, it reports 0.0 milliseconds. What is the most likely reason?

- [ ] The processor is fast enough to add a million numbers in no time
- [x] The compiler removed the loop, because its result is never used
- [ ] The timer is broken

A million additions take at least a fraction of a millisecond. Because nothing ever reads `total`, the compiler deleted the whole loop. Print `total` after the loop, and the time becomes real.
:::

## Practice

:::problem id=prac-profile-share title="Where should you start?" source="ps4.pdf" kind=exercise solution_origin=source
A profiler reports that `load_data` uses 15% of the time, `analyze_records` uses 75%, and `save_results` uses 10%. The whole program takes 100 seconds.

:::check id=prac-profile-share-q1
The bottleneck is {{=analyze_records|load_data|save_results}}.

It uses 75% of the time, far more than the other two together.
:::

:::check id=prac-profile-share-q2
If you make `save_results` 10 times faster, the program takes {{=91 seconds|10 seconds|90 seconds}}.

`save_results` drops from 10 seconds to 1 second. The other 90 seconds stay, so the total is 91 seconds.
:::

:::check id=prac-profile-share-q3
If you instead make `analyze_records` twice as fast, the program takes {{=62.5 seconds|50 seconds|75 seconds}}.

`analyze_records` drops from 75 to 37.5 seconds. The other 25 seconds stay, so the total is 62.5 seconds. Halving the bottleneck helps far more than a tenfold gain on a small part.
:::
:::

:::problem id=prac-median-runs title="Reading a benchmark" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
Version A was timed five times: 40, 41, 39, 90, 40 milliseconds. Version B was timed five times: 38, 37, 38, 39, 38 milliseconds.

:::check id=prac-median-runs-q1
The median time of version A is {{=40 ms|50 ms|39 ms}}.

Sorted, the times are 39, 40, 40, 41, 90. The middle one is 40. The 90 is a run that something else disturbed.
:::

:::check id=prac-median-runs-q2
Comparing medians, version B is {{=faster than A, by about 5%|slower than A|faster than A, by about 25%}}.

B's median is 38 ms and A's is 40 ms, so B is about 5% faster. The average of A, 50 ms, would make B look 25% faster, because of the one 90 ms run.
:::
:::

**Next:** before you change code by hand, you should know what the compiler already does for you. That is the next lesson.
