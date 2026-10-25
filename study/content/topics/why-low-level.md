---
id: why-low-level
title: Why the machine matters
sources:
  - "Lecture 1 - Introduction.pdf"
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

:::definition id=def-signed-overflow title="Signed overflow" source="C11 standard, section 6.5, paragraph 5"
If a calculation on a signed integer type (such as `int`) gives a result too big or too small for that type, the C program has **undefined behavior**.
:::

**Undefined behavior** means the C rules say nothing about what happens. The program might give the "wrapped" negative number. It might give something else. The compiler (the tool that turns C into machine code) is allowed to assume overflow never happens, and may even remove your checks for it. So treat signed overflow as a bug you must avoid.

If you *want* the wrap-around, use an **unsigned** type. Unsigned numbers are never negative, and C promises that they wrap around: the result is always the true answer with the extra high bits thrown away.

```c
#include <stdint.h>      /* gives us uint32_t: an unsigned 32-bit number */

uint32_t x = 1410065407u;   /* the u at the end means "unsigned" */
uint32_t product = x * x;   /* always 0xBAF83801: wrap-around is guaranteed */
```

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

:::problem id=prac-square-sign title="Squaring 50000" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new number this time: $x = 50000$, stored in a 32-bit `int`. Its true square is $2\,500\,000\,000$, which is `0x9502F900` in hexadecimal.

:::check id=prac-square-sign-q1
Does $2\,500\,000\,000$ fit in an `int`? {{=No, it is bigger than 2147483647|Yes, it is less than 4.3 billion|Yes, every square of an int fits}}

The largest `int` is $2\,147\,483\,647$. About 4.3 billion is how many bit patterns 32 bits have, but half of them are used for negative numbers.
:::

:::check id=prac-square-sign-q2
`0x9502F900` is exactly 8 hex digits, so all 32 bits are kept. Read as a signed 32-bit number, those bits are

- [x] negative, because the first hex digit `9` is `1001` in binary, so the leftmost bit is 1
- [ ] positive, because nothing was thrown away
- [ ] zero, because the answer overflowed

A leftmost bit of 1 means negative. (The value is $2\,500\,000\,000 - 2^{32} = -1\,794\,967\,296$.) Nothing was cut off here, yet the sign still flipped.
:::

:::check id=prac-square-sign-q3
In C, `int x = 50000; int y = x * x;` is {{=undefined behavior|guaranteed to give -1794967296|guaranteed to give 2500000000}}.

The true answer does not fit in an `int`, so this is signed overflow. Use `uint32_t` if you want the guaranteed wrap-around.
:::
:::

:::problem id=prac-float-add title="Where does the 1 go?" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
New numbers: $x = 1$, $y = 10^{20}$, and $z = -10^{20}$, as `double` numbers added in the order written. Remember that near $10^{20}$, neighboring `double` values are 16384 apart.

:::check id=prac-float-add-q1
$(x + y) + z$ equals {{=0.0|1.0|1e20}}.

$1 + 10^{20}$ rounds back to $10^{20}$, because 1 is much smaller than the gap of 16384. Then $10^{20} + (-10^{20}) = 0$.
:::

:::check id=prac-float-add-q2
$x + (y + z)$ equals {{=1.0|0.0|-1e20}}.

$y + z$ is exactly 0, and $1 + 0 = 1$.
:::

:::check id=prac-float-add-q3
To keep a small number from being lost, you should

- [x] Add the numbers that cancel each other first, then add the small one
- [ ] Always add from left to right
- [ ] Switch from `double` to `int`

The small number survives when it is added to something of similar size. Adding it to a huge number first rounds it away.
:::
:::

:::problem id=prac-loop-stride title="Stride in a table of doubles" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A different table this time: `double M[1000][1000]`. Each `double` is 8 bytes, and each row has 1000 of them. Both loops do `sum += M[i][j]` for every `i` and `j`.

:::check id=prac-loop-stride-q1
When `j` is the inner loop, each step moves {{=8 bytes|4 bytes|8000 bytes}} in memory.

Increasing `j` by 1 moves to the next `double` in the same row: 8 bytes.
:::

:::check id=prac-loop-stride-q2
When `i` is the inner loop, each step moves {{=8000 bytes|8 bytes|1000 bytes}} in memory.

Increasing `i` by 1 moves down a full row: $1000 \times 8 = 8000$ bytes.
:::

:::check id=prac-loop-stride-q3
How many `double`s arrive together in one 64-byte cache line? {{=8|16|64}}

$64 / 8 = 8$. The row-by-row loop uses all 8; the column-by-column loop uses one and then jumps 8000 bytes away.
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
