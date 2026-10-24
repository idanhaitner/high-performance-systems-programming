---
id: why-low-level
title: Why the machine matters
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/03-expressions/lesson.md
---

This course is about one question: **why does one program run fast while another, which does the same job, runs slow?**

To answer it, we have to look underneath the code we write and see what the computer actually does. This first lesson gives you three small surprises that show why that matters:

1. A computer can multiply two positive numbers and get a negative answer.
2. A computer can add the same three numbers in two different orders and get two different answers.
3. Two loops that copy exactly the same data can run at very different speeds.

All three have the same cause: a computer is a physical machine with limits. Numbers are stored in a fixed amount of space, and memory is read in chunks. By the end of the lesson you will understand each surprise. You do not need to know C yet; we explain every piece of code as we go.

![The course proceeds from C to memory, cache and the CPU, multicore execution, and the GPU.](../assets/figures/course-path.svg)

The picture above is the road map of the whole course. We start with C and memory (this lecture), then move on to the cache, the processor (CPU), machines with many processors (multicore), and graphics cards (GPU).

## Nothing is free: every convenience is real work

When you write `x = a + b` in a programming language, it feels like one simple step. But somewhere, real hardware has to do it: fetch `a` and `b` from memory, add them, and store the result. The friendly line of code is an **abstraction**: a simple surface that hides the work underneath.

Abstractions are good. They let us write programs without thinking about wires and transistors. But they have a cost, and that cost is exactly the cost of the hidden work.

:::definition id=def-no-magic title="Cost of an abstraction" source="Lecture 1 - Introduction.pdf"
Every abstraction is carried out by some software or hardware underneath it. The time an operation takes is the time that hidden work takes. There is no magic.
:::

Different languages hide different amounts of work:

- **Python and Java** hide a lot. They decide where your data lives in memory, how it is arranged, and when it is cleaned up. This is convenient, but you cannot easily see or control those decisions.
- **C** hides very little. You decide how big each number is, where it is stored, and how data is laid out. Most lines of C turn into just a few machine instructions.

Neither is "better". They are different trade-offs. This course uses C because it lets us **see** what the machine is doing, and you cannot speed up what you cannot see.

![Application code uses explicit C operations, which become instructions and memory accesses.](../assets/figures/abstraction-stack.svg)

| Question | Python / Java | C |
| --- | --- | --- |
| Who decides when memory is freed? | The language does it for you | You do |
| Who decides how data is arranged in memory? | The language, and it is hidden | You, and you can see it |
| How big is a number? | Often "as big as needed" | A fixed size you choose |

The same algorithm can run many times faster or slower depending only on how its data is stored and how it walks through memory. That is why programmers who build compilers, operating systems, games, and embedded devices need this knowledge.

:::check id=chk-no-magic
Which statement best describes the cost of an abstraction?

- [ ] The cost is decided by the language's name, before any code runs
- [x] The cost is the work done by the software or hardware underneath it
- [ ] There is a cost only if you rewrite the program in assembly

An abstraction is a convenient surface. Underneath, real instructions run and real memory is read. That work is the cost.
:::

## Surprise 1: a positive number times itself can come out negative

### Numbers live in boxes of fixed size

A computer stores everything as **bits**. A bit is a single 0 or 1. A group of 8 bits is a **byte**.

In C, an `int` (a whole number) is usually stored in **32 bits** (4 bytes). With 32 bits you can write $2^{32}$ different patterns, about 4.3 billion. Because `int` must also hold negative numbers, its range is split roughly in half:

$$-2\,147\,483\,648 \;\le\; \texttt{int} \;\le\; 2\,147\,483\,647$$

So an `int` cannot hold numbers bigger than about 2.1 billion. The box is simply too small.

### How negative numbers are stored

Computers use a scheme called **two's complement** for negative numbers. You only need one fact about it now: **if the leftmost bit is 1, the number is read as negative.** For example, with 8 bits, `00000101` is $5$ and `11111011` is $-5$.

### What happens when the answer does not fit

Take a smaller example first, with 8-bit numbers (range $-128$ to $127$). Compute $100 + 100 = 200$. The number 200 does not fit. In binary, 200 is `11001000`, and its leftmost bit is 1, so if we read those 8 bits as a signed number we get $-56$. The real answer "overflowed" its box.

The lecture's example is the same thing with bigger numbers. Take $x = 1\,410\,065\,407$, which fits in an `int`. The true square is:

$$1410065407 \times 1410065407 = 1\,988\,284\,452\,018\,075\,649$$

That is about $2 \times 10^{18}$, far too big for 32 bits. Written in hexadecimal (base 16, where each digit stands for 4 bits) the full answer is `0x1B97CE2CBAF83801`. If we keep only the lowest 32 bits, we get `0xBAF83801`. Its leftmost bit is 1, so read as a signed 32-bit number it is $-1\,158\,137\,855$. A positive number squared, "equal" to a negative number.

### What C actually promises

Here is an important detail. What we just did was a calculation about bits. **C itself does not promise that you get that negative number.**

:::definition id=def-representation-limit title="Fixed-size numbers" source="Lecture 1 - Introduction.pdf"
A number in the computer is stored in a fixed number of bits. If the true result of a calculation needs more bits than that, it does not fit, and something other than the true answer happens.
:::

:::definition id=def-signed-overflow title="Signed overflow" source="c/03-expressions/lesson.md"
If a calculation on a signed integer type (such as `int`) gives a result too big or too small for that type, the C program has **undefined behavior**.
:::

**Undefined behavior** means the C rules say nothing about what happens. The program might give the "wrapped" negative number. It might give something else. The compiler (the tool that turns C into machine code) is allowed to assume overflow never happens, and may even remove your checks for it. So treat signed overflow as a bug you must avoid.

If you *want* the wrap-around, use an **unsigned** type. Unsigned numbers are never negative, and C promises that they wrap around: the result is always the true answer with the extra high bits thrown away.

```c
#include <stdint.h>      /* gives us uint32_t: an unsigned 32-bit number */

uint32_t x = 1410065407u;   /* the u at the end means "unsigned" */
uint32_t product = x * x;   /* always 0xBAF83801: wrap-around is guaranteed */
```

:::problem id=worked-square-overflow title="Square of 1410065407" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Separate three things: the true mathematical answer, what the lowest 32 bits look like, and what C promises for a signed `int`.

:::solution
1. **True answer:** $1988284452018075649$, which is `0x1B97CE2CBAF83801` in hexadecimal.
2. **Lowest 32 bits:** `0xBAF83801`. Its leftmost bit is 1, so read as a signed 32-bit number it is $-1158137855$.
3. **What C promises for `int`:** nothing. The answer does not fit, so this is undefined behavior. If you need the wrapped result, use `uint32_t`, where wrap-around is guaranteed.
:::
:::

:::trap
Running an overflow once, seeing a negative number, and concluding "that's what C does". A different compiler, a different optimization setting, or a small change nearby can give a different result.
:::

## Surprise 2: adding in a different order gives a different answer

### Decimal numbers are stored approximately

Numbers with a fractional part, like $3.14$, are stored as **floating-point** numbers. In C the common type is `double`. A `double` is a bit like scientific notation ($3.14 \times 10^{0}$): it stores a sign, some digits, and an exponent saying where the decimal point goes.

The catch is that it keeps only about 16 significant digits. So a very large number cannot also remember a tiny part after the decimal point. Near $10^{20}$, the gap between one `double` and the next one is 16384. Adding $3.14$ to a number that big changes nothing, because there is no `double` that close to it. The $3.14$ is rounded away.

### The example

Let $x = 10^{20}$, $y = -10^{20}$, and $z = 3.14$.

**Order 1: add $x$ and $y$ first.**

$$(10^{20} + (-10^{20})) + 3.14 = 0 + 3.14 = 3.14$$

The two big numbers cancel exactly, and $3.14$ is added to 0. Correct.

**Order 2: add $y$ and $z$ first.**

$$10^{20} + ((-10^{20}) + 3.14) = 10^{20} + (-10^{20}) = 0$$

The $3.14$ is too small to change $-10^{20}$, so it is lost. Then the big numbers cancel and we get 0.

In school math, $(a + b) + c = a + (b + c)$ always. This rule is called **associativity**. With floating-point numbers it can fail, because each step rounds. (Swapping the two numbers in a single addition, $a + b = b + a$, is called commutativity, and that one still holds.)

One note: this assumes the computer adds in the order written. Some compiler settings, such as `-ffast-math`, allow the compiler to regroup additions to go faster, which can change the result.

:::problem id=worked-float-associativity title="Two associations of 1e20 and 3.14" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
For $x = 10^{20}$, $y = -10^{20}$, and $z = 3.14$, compute $(x + y) + z$ and $x + (y + z)$ with `double` numbers. Which rule of school math fails?

:::solution
$(x + y) + z = 0 + 3.14 = 3.14$.

$x + (y + z)$: the inner sum $-10^{20} + 3.14$ rounds back to $-10^{20}$, because a `double` that large cannot hold the small part. Then $10^{20} + (-10^{20}) = 0$.

Same numbers, different grouping, different answer, so **associativity** fails.
:::
:::

## Surprise 3: the order you visit memory changes the speed

### How a 2D array sits in memory

Memory is one long line of bytes. A 2D array (a table with rows and columns) has to be flattened onto that line. C does it **row by row**: first all of row 0, then all of row 1, and so on. This is called **row-major order**.

So in an array `A`:

- `A[i][j]` and `A[i][j + 1]` (next column, same row) are **neighbors** in memory.
- `A[i][j]` and `A[i + 1][j]` (same column, next row) are **a whole row apart**.

An `int` takes 4 bytes on typical machines, so neighbors are 4 bytes apart. In the examples below each row has 2049 numbers, so going down one row jumps $2049 \times 4 = 8196$ bytes.

![Row-major order places consecutive columns in adjacent cells and consecutive rows one row apart.](../assets/figures/loop-stride.svg)

### Why neighbors are faster: the cache

Reading from main memory is slow. To help, the processor keeps a small, fast memory called the **cache**. When you read one byte, the computer does not fetch just that byte. It fetches a whole block around it, called a **cache line**, usually 64 bytes. That is 16 `int`s at once.

If your next read is a neighbor, it is already in the cache, and reading it is very fast. If your next read is far away, the computer must go back to slow memory. Using nearby data soon after other nearby data is called **spatial locality**, and it is one of the most important ideas in this course.

### Three loops that copy the same table

All three copy every number from `A` into `B`. They differ only in the order.

**Loop 1: row by row.** The inner loop changes `j`, so it moves along a row, one neighbor at a time.

```c
int i, j;
for (i = 0; i < 2049; i++)          /* for each row...            */
    for (j = 0; j < 2049; j++)      /* ...walk across its columns */
        B[i][j] = A[i][j];
```

**Loop 2: column by column.** The inner loop changes `i`, so every step jumps down a whole row, 8196 bytes away.

```c
int i, j;
for (j = 0; j < 2049; j++)          /* for each column...         */
    for (i = 0; i < 2049; i++)      /* ...walk down its rows      */
        B[i][j] = A[i][j];
```

**Loop 3: row by row, three at a time.** Same order as Loop 1, but each step of the loop copies three neighbors. Since $2049 = 3 \times 683$, every number is still copied exactly once.

```c
int i, j;
for (i = 0; i < 2049; i++)
    for (j = 0; j < 2049; j += 3) {   /* jump 3 columns each step */
        B[i][j] = A[i][j];
        B[i][j + 1] = A[i][j + 1];
        B[i][j + 2] = A[i][j + 2];
    }
```

**What to expect:**

- **Loop 1** reads neighbors. One trip to memory brings 16 numbers into the cache, and the next 15 reads are almost free. Good locality.
- **Loop 2** jumps 8196 bytes every step. Each read lands in a different cache line, so it keeps going back to slow memory. Poor locality, usually much slower.
- **Loop 3** has the good order of Loop 1 and also does less loop bookkeeping (fewer `j` updates and comparisons). This trick is called **loop unrolling**.

The exact speed must be measured on a real machine, because the compiler may rearrange loops and every processor's cache is different. But the distance between consecutive reads, called the **stride**, is something you can work out just by reading the code.

:::problem id=worked-row-major title="Which copy walks neighboring ints" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
For the three loops above (a 2049 by 2049 table of `int`), how far apart in memory are two consecutive reads of the inner loop, and what does that mean for the cache?

:::solution
- **Loop 1** (`j` inside): consecutive reads are neighbors, 4 bytes apart. They share cache lines, so locality is good.
- **Loop 2** (`i` inside): consecutive reads are a row apart, $2049 \times 4 = 8196$ bytes. They never share a cache line, so locality is poor.
- **Loop 3**: same 4-byte steps as Loop 1, every number copied once (because 2049 is divisible by 3), and less loop bookkeeping per number.

The actual timing still depends on the compiler and the machine.
:::
:::

:::trap
Comparing the loops by counting the copies. All three do exactly the same number of copies. What differs is how far apart in memory the consecutive reads are.
:::

## What this course covers

The three surprises each point at a layer of the machine that affects speed. The course goes through five such layers, one after another:

1. **How data is stored** (sizes of numbers, layout of arrays and records) — this lecture
2. **Memory and the cache** — why nearby data is faster
3. **How the processor runs instructions**
4. **Many processors working together** (multicore)
5. **Graphics cards** (GPUs), which run thousands of small tasks at once

This lecture covers the first layer, plus a picture of how a running program's memory is organized, which we need for the second layer.

**Tools you will use:** Linux (the operating system), GCC (the C compiler), GDB (a debugger that lets you pause a program and look inside), and any text editor. **Reference book:** *Computer Systems: A Programmer's Perspective*, Bryant and O'Hallaron, 3rd edition (2016).

## Practice

:::problem id=prac-square-sign title="When a square is negative" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use $x = 1410065407$. Its true square, in hexadecimal, is `0x1B97CE2CBAF83801`. Each hex digit is 4 bits, so 32 bits is the last 8 hex digits.

:::check id=prac-square-sign-q1
The lowest 32 bits of that product are {{=0xBAF83801|0x1B97CE2C|0x00000000}}.

The lowest 32 bits are the last 8 hex digits: `0xBAF83801`.
:::

:::check id=prac-square-sign-q2
Why do those 32 bits read as a negative number?

- [x] The leftmost of the 32 bits is 1
- [ ] Multiplying two odd numbers always gives a negative number
- [ ] C replaces every overflow with $-1$

The first hex digit is `B`, which is `1011` in binary, so the leftmost bit is 1. In two's complement, a leftmost 1 means negative. This is a fact about the bits, not a promise from C.
:::

:::check id=prac-square-sign-q3
In C, overflow of a signed `int` is {{=undefined behavior|guaranteed to wrap around|guaranteed to give this negative value}}.

C makes no promise at all for signed overflow. Only unsigned types, such as `uint32_t`, are guaranteed to wrap around.
:::
:::

:::problem id=prac-float-add title="Which association keeps 3.14" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use $x = 10^{20}$, $y = -10^{20}$, and $z = 3.14$, as `double` numbers added in the order written.

:::check id=prac-float-add-q1
$(x + y) + z$ equals {{=3.14|0.0|1e20}}.

$x + y$ is exactly 0, and $0 + 3.14 = 3.14$.
:::

:::check id=prac-float-add-q2
$x + (y + z)$ equals {{=0.0|3.14|-3.14}}.

$3.14$ is too small to change $-10^{20}$, so $y + z$ stays $-10^{20}$. Adding $x$ then gives 0.
:::

:::check id=prac-float-add-q3
The school-math rule that fails here is {{=associativity of addition|commutativity of addition|closure of addition}}.

Only the grouping (which pair is added first) changed, and the answer changed. The rule about grouping is associativity.
:::
:::

:::problem id=prac-loop-stride title="Stride of the column-wise copy" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Both loops do `B[i][j] = A[i][j]` for every `i` and `j` from 0 to 2048. Each `int` is 4 bytes, and each row has 2049 of them.

:::check id=prac-loop-stride-q1
When `j` is the inner loop, each step moves {{=4 bytes|2049 bytes|8196 bytes}} in memory.

Increasing `j` by 1 moves to the next number in the same row: one `int`, 4 bytes.
:::

:::check id=prac-loop-stride-q2
When `i` is the inner loop, each step moves {{=8196 bytes|4 bytes|1 byte}} in memory.

Increasing `i` by 1 moves down a full row: $2049 \times 4 = 8196$ bytes.
:::

:::check id=prac-loop-stride-q3
Why is the column-by-column loop usually slower?

- [x] Consecutive reads are a whole row apart, so they never share a cache line
- [ ] It copies more numbers than the row-by-row loop
- [ ] C does not allow `i` to be the inner loop

Both loops copy the same numbers. The row-by-row loop reads neighbors, which arrive together in one cache line. The column-by-column loop jumps 8196 bytes each time, far more than a 64-byte cache line.
:::
:::

:::problem id=prac-no-magic title="What C exposes in this course" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-no-magic-q1
This course uses C because C {{=lets you see sizes, addresses, and memory layout|is the language every GPU runs|replaces the operating system}}.

To understand speed, we need to see what the machine does with our data. C shows us number sizes, memory addresses, and how data is arranged.
:::

:::check id=prac-no-magic-q2
Which statements describe C, compared with Python or Java?

- [x] You decide when memory is reserved and freed
- [x] You can see addresses and how data is arranged in memory
- [ ] The language automatically frees every piece of memory for you
- [ ] How data is arranged in memory is hidden from you

In C you control memory and can see its layout. Python and Java manage memory for you and hide the layout.
:::
:::

**Next:** in [Values and types](topic:c-data-types) we meet C's basic kinds of values: how many bytes each one takes, and how C's division and conversions work.
