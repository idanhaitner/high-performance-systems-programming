---
id: pipeline
title: How the processor overlaps instructions
sources:
  - "Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
---

In [What the compiler does for you](topic:compiler-optimizations) you saw that the compiler rewrites your code. Now look at the other side: how the processor runs the machine instructions it gets. The key idea is that it does not finish one instruction before starting the next. It works on several at once, like an assembly line. This picture explains most of the rest of this lecture.

## A puzzle to start

Here is a loop over 30 million `float`s. Each element gets a number added or taken away, depending on its value:

```c
#define N 30000000
float A[N];

for (int i = 0; i < N; i++) {
    if (A[i] > 10)
        A[i] += N;
    else
        A[i] -= N;
}
```

It was timed on three arrays of the same size:

| Array | Its values | Time |
| --- | --- | --- |
| `A1` | all small, like 1, 2, 3, 2, 6 | 19.81 ms |
| `A2` | all big, like 12, 132, 34, 15 | 15.01 ms |
| `A3` | a random mix, like 12, 2, 3, 15, 1 | 186.83 ms |

Every run does the same number of iterations, the same number of comparisons, one addition or subtraction per element, and one read and one write of each element. Yet the random mix is about **ten times slower**. Why would the **values** change the speed? To answer that, you need to see how instructions flow through the processor.

## Five steps for every instruction

In a simple model, the processor runs each machine instruction in five steps. Take `x = x + 1`:

1. **Fetch.** Bring the instruction itself from memory into the processor.
2. **Decode.** Work out what it means: an addition, whose input is `x` and whose output is `x`.
3. **Read.** Get the input values, here the current value of `x`.
4. **Execute.** Do the work: compute `x + 1`.
5. **Write.** Store the result back into `x`.

Real processors split the work into more steps than this, but five is enough to see the idea.

Each step uses a **different part** of the processor: one part fetches, another decodes, another adds. So while one instruction is being executed, the part that fetches is free, and it could already fetch the next instruction.

## The pipeline

Think of a laundry with a washer, a dryer, and a folding table. You could wash, dry, and fold one load, and only then start the second load. Or you could put load 2 in the washer as soon as load 1 moves to the dryer. Each load still takes the same time, but loads finish much more often.

A processor does the same. A new instruction enters the first step on every tick of the clock, while the ones before it move along. This is called a **pipeline**.

![Two timing charts. Without a pipeline, three instructions each go through the five steps F, D, R, E, W one after another, which takes 15 ticks. With a pipeline, each instruction starts one tick after the one before, so the three finish after 7 ticks. With n instructions, it is 5 times n ticks without a pipeline and 4 plus n ticks with one.](../assets/figures/pipeline.svg)

Count the ticks for `n` instructions:

- **Without a pipeline:** each instruction takes 5 ticks, one after the other, so `5 × n` ticks.
- **With a pipeline:** the first instruction needs 5 ticks to come out. The pipe is now full, and from then on one instruction finishes on **every** tick. So the total is `5 + (n − 1)`, which is `4 + n` ticks.

For 3 instructions that is 15 ticks against 7. For a million instructions it is 5,000,000 against 1,000,004, which is almost exactly **5 times faster**. With 5 steps, a full pipeline can be up to 5 times faster.

:::definition id=def-pipeline title="Pipeline" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf"
A **pipeline** splits the running of each instruction into steps done by separate hardware, so that several instructions can be in different steps at the same moment. When it is full, one instruction finishes on every clock tick.
:::

:::check id=chk-pipeline-ticks
A processor has a pipeline with 5 steps, and each step takes one tick. How many ticks does it take to run 10 instructions, if nothing ever has to wait?

- [ ] 50
- [x] 14
- [ ] 10

The first instruction needs 5 ticks. After that, one more instruction finishes on each tick, so the other 9 need 9 more ticks: 5 + 9 = 14. Without a pipeline it would be 10 × 5 = 50.
:::

## When an instruction needs the one before it

The pipeline works perfectly only when the instructions do not depend on each other. Look at two instructions:

```text
x = y + z
w = x
```

The second one needs the **new** value of `x`. But the first one writes `x` only in its last step. If the second one reads `x` too early, it gets the old value, which is wrong. This situation, reading a value that an earlier instruction has not yet written, is called a **read-after-write hazard**.

The processor handles it by making the second instruction **wait** for a tick or two. A wait like this is called a **stall**, or a "bubble" in the pipeline. While it waits, the pipeline does less useful work.

Two tricks make stalls shorter or remove them:

- **Forwarding.** The result of the addition exists as soon as the Execute step ends, before it is written back. The processor can pass it straight to the next instruction that needs it. That shortens the wait, though a short wait can remain.
- **Reordering.** If some later instruction does not depend on either one, it can run in the gap. For example:

```text
x = y + z        x = y + z
w = x       →    a = b + c      (independent, fills the gap)
a = b + c        w = x
```

Swapping the last two lines gives the same results, because `a = b + c` uses none of `x` and `w`. The compiler, and the processor itself, can only do this when the instructions really are independent and have no other effects.

You do not have to insert stalls or forwarding yourself: the compiler and the processor take care of it. What you **can** do is write code with more independent work in it, which gives them something to fill the gaps with. A later lesson does exactly that.

:::check id=chk-raw-hazard
A processor runs `t = a * b` and right after it `u = t + 1`. Why might the second instruction have to wait?

- [ ] Because a multiplication and an addition cannot be in the pipeline together
- [x] Because it needs the value of `t`, which the first instruction has not finished computing
- [ ] Because the processor runs only one instruction at a time

The second instruction reads `t`, and the first one writes `t`. Until that result exists, the second one cannot go on. This is a read-after-write hazard, and the wait is a stall.
:::

## Jumps make the pipeline guess

There is one more problem. A loop ends with a jump that depends on a test, something like "go back to the top if `i < n`". This is called a **branch**: the program can go one of two ways.

The answer to the test is known only when the branch instruction reaches its Execute step. But by then, the pipeline has already fetched several more instructions after it. Which ones should it have fetched: the ones at the top of the loop, or the ones after the loop?

If it fetched the wrong ones, their work must be thrown away, and the right instructions must start from the beginning of the pipeline. Throwing out the started work is called a **pipeline flush**, and it wastes several ticks every time it happens.

That is the answer to the puzzle at the start. The `if (A[i] > 10)` is a branch. For `A1` and `A2`, it goes the same way every time, so the processor guesses correctly. For the random `A3`, it goes either way at random, so the processor often guesses wrong, flushes, and loses time. The next lesson is about these guesses.

:::check id=chk-why-flush
In a pipelined processor, why can a branch whose direction is hard to guess slow a loop down?

- [ ] Because the comparison in the branch takes many ticks
- [x] Because when the processor starts the wrong instructions, it must throw their work away and start again
- [ ] Because the branch is removed from the pipeline

The direction is known only after the branch is executed. Until then, the processor has already started later instructions. If they were the wrong ones, their work is flushed, and those ticks are lost.
:::

## Practice

:::problem id=prac-pipeline-count title="Counting ticks" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
A processor runs every instruction in 5 steps, and each step takes one tick. Nothing ever has to wait.

:::check id=prac-pipeline-count-q1
Without a pipeline, 4 instructions take {{=20|8|5}} ticks.

Each one takes 5 ticks, one after the other: 4 × 5 = 20.
:::

:::check id=prac-pipeline-count-q2
With a pipeline, 4 instructions take {{=8|20|4}} ticks.

The first finishes at tick 5, and then one more finishes on each tick: 4 + 4 = 8.
:::

:::check id=prac-pipeline-count-q3
For a very long program, the pipeline makes it about {{=5|4|2}} times faster.

5 × n divided by 4 + n gets closer and closer to 5 as n grows, one for each step of the pipeline.
:::
:::

:::problem id=prac-reorder-gap title="Filling a gap" source="Lecture_04_Code_Optimization_in_C  -  ver 2.pdf" kind=exercise solution_origin=derived
A processor runs three instructions in this order: `x = y + z`, then `w = x`, then `a = b + c`.

:::check id=prac-reorder-gap-q1
The instruction that must wait for the one before it is {{=w = x|a = b + c|x = y + z}}.

`w = x` needs the new value of `x`, which the instruction just before it is still computing.
:::

:::check id=prac-reorder-gap-q2
Moving {{=a = b + c|w = x|x = y + z}} to the second place fills the gap without changing any result.

`a = b + c` does not use `x` or `w`, and nothing else uses `a`, so it can run while the processor waits for `x`.
:::
:::

**Next:** the processor guesses which way each branch goes. The next lesson shows how it guesses, when the guess fails, and how to write code that helps it.
