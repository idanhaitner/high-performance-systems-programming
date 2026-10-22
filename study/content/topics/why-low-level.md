---
id: why-low-level
title: Why we go low level
sources:
  - "Lecture 1 - Introduction.pdf"
---

High-level code is a promise that something underneath will keep. This course starts where that promise meets the machine: the representation of a number, the order of bytes in memory, and the process the operating system actually runs. C is the window, because it lets you write ordinary programs and still name addresses, widths, and bits.

The path runs from C, through memory, through cache and the CPU, through multicore, and on to the GPU.

![The course walks from C through memory, cache and the CPU, multicore, and the GPU.](../assets/figures/course-path.svg)

## There is no magic

:::definition id=def-no-magic title="An abstraction has an implementation" source="Lecture 1 - Introduction.pdf"
Every abstraction is implemented by something underneath. Performance starts where abstractions meet reality.
:::

A language such as Python or Java gives you objects, automatic memory, and arithmetic that looks like the arithmetic you learned. Those features are real, and they are also code and hardware. The stack of abstractions runs downward:

![Python and Java sit on C, and C sits on the hardware and the operating system.](../assets/figures/abstraction-stack.svg)

C is in the middle on purpose. It is efficient and portable, it was designed in 1972 at Bell Labs by Dennis Ritchie, and it still lets a program reach bit-level details. The tradeoff is more abstraction on one side and more control on the other.

| | Python / Java | C |
| --- | --- | --- |
| Memory | automatic | explicit |
| Data | objects, hidden layout | addresses and representation you choose |
| Machine | implementation details hidden | close interaction with the OS and the hardware |

C is the course's systems language. It is the window into the machine. The goal of the course is the machine, and C is how the programs in this course reach it.

The same idea shows up in the work this course is preparing you to read: compilers and linkers, the operating system, embedded and real-time systems, and low-level work such as reverse engineering, patching, and direct hardware manipulation. Think about more than the algorithm. Two programs with the same algorithm can differ in speed and in reliability once the representation and the memory system get a vote.

:::check id=chk-no-magic
Where does performance start?

- [ ] In the choice of a high-level language, before any representation is involved
- [x] Where abstractions meet the implementation underneath them
- [ ] Only after a program is rewritten in assembly by hand

The opening claim is that every abstraction is implemented by something underneath, and performance starts at that meeting point.
:::

## Three places theory breaks

The same warning covers the integer example and the floating-point example. In Hebrew: לא (תמיד) ניתן לסמוך על כך שמה שאנחנו יודעים בתאוריה מתקיים גם במחשב. What we know from theory does not always hold on the computer, and the programs we write have to live with that. Each case is a limit of the representation.

## A square can come out negative

:::definition id=def-representation-limit title="A limit of the representation" source="Lecture 1 - Introduction.pdf"
When a machine type cannot hold the mathematical result, the stored result follows the type's representation. That outcome is a limit of the representation.
:::

A 32-bit signed multiplication does this:

$$1410065407 \times 1410065407 \rightarrow -1158137855$$

The mathematical product is $1988284452018075649$, which in hexadecimal is `0x1B97CE2CBAF83801`. A 32-bit cell keeps only the low 32 bits, `0xBAF83801`. The top bit of that pattern is 1, so reading the cell as a signed 32-bit integer yields $-1158137855$. An `int` here is 4 bytes, which is this width.

:::theorem id=thm-square-sign title="A machine square need not be non-negative" source="Lecture 1 - Introduction.pdf"
For a 32-bit signed `int`, there exists a value $x$ such that the computed product $x \cdot x$ is negative.

:::proof
**Intuition.** The mathematical square is far outside the range of a 32-bit signed cell. The cell keeps a slice of the bits, and that slice has its sign bit set.

**Proof.** Take $x = 1410065407$. The integer product is $1988284452018075649 = \mathtt{0x1B97CE2CBAF83801}$. The low 32 bits are $\mathtt{0xBAF83801}$. Interpreted as a two's-complement 32-bit value, the leading 1 means the result is negative, and the stored value is $-1158137855$. So the computed square is negative.

**What the proof used.** The product $1988284452018075649$, the 4-byte `int`, and the reading of a 32-bit pattern whose high bit is 1 as a negative signed value.
:::
:::

:::problem id=worked-square-overflow title="Square of 1410065407" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Is $x^2 \ge 0$ when $x = 1410065407$ and the product is computed in a 32-bit signed `int`? The computed product is $-1158137855$. Explain that result as a fact about representation.

:::solution
The mathematical product is $1988284452018075649$ (`0x1B97CE2CBAF83801`). A 32-bit signed cell stores `0xBAF83801`. That pattern's high bit is 1, so the value read back is $-1158137855$. This is a limit of the representation: the type cannot hold the mathematical square, so the inequality $x^2 \ge 0$ is a statement about mathematical integers, and the program computed a 32-bit product.
:::
:::

:::trap
Treating a computed `int` product as a mathematical integer. Once the product leaves the range of the type, the bits that remain are a different number, and that number can be negative.
:::

## Addition of floating values depends on order

The next question is whether $(x + y) + z = x + (y + z)$.

$$
(1.0\times 10^{20} + (-1.0\times 10^{20})) + 3.14 \rightarrow 3.14
$$

$$
1.0\times 10^{20} + ((-1.0\times 10^{20}) + 3.14) \rightarrow 0.0
$$

:::theorem id=thm-float-assoc title="Floating-point addition on these values is not associative" source="Lecture 1 - Introduction.pdf"
For $x = 1.0\times 10^{20}$, $y = -1.0\times 10^{20}$, and $z = 3.14$, the two associations produce different results.

:::proof
**Intuition.** A floating-point value near $10^{20}$ does not have a digit for a contribution as small as $3.14$. Adding $3.14$ to a huge magnitude can leave the huge magnitude unchanged. Adding the two huge values to each other first cancels them, and then $3.14$ has room to survive.

**Proof.** In $(x + y) + z$ the sum $x + y$ is $0$, and $0 + 3.14$ is $3.14$. In $x + (y + z)$ the inner sum $y + z$ is still stored as $-1.0\times 10^{20}$, because $3.14$ is below the unit in the last place at that magnitude. Adding $x$ then cancels that value to $0$. Both results are real. They differ, so the two associations are different computations on this representation.

**What the proof used.** The two numeric results, and the fact that a finite floating-point format has a limited significand, so a small addend can be lost beside a much larger magnitude.
:::
:::

:::problem id=worked-float-associativity title="Two associations of 1e20 and 3.14" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Compute both associations and say which algebraic law fails for these machine values.

:::solution
$(1.0\times 10^{20} + (-1.0\times 10^{20})) + 3.14$ evaluates to $3.14$. The other association evaluates to $0.0$. Associativity of addition fails for these floating-point values. This is again a limit of the representation.
:::
:::

## Loop order changes which bytes come next

A computer has several kinds of memory. Three ways to copy an `int` matrix of side 2049 need not take the same time.

```c
int i, j;
for (i = 0; i < 2049; i++)
    for (j = 0; j < 2049; j++)
        B[i][j] = A[i][j];
```

```c
int i, j;
for (j = 0; j < 2049; j++)
    for (i = 0; i < 2049; i++)
        B[i][j] = A[i][j];
```

```c
int i, j;
for (i = 0; i < 2049; i++)
    for (j = 0; j < 2049; j += 3) {
        B[i][j] = A[i][j];
        B[i][j + 1] = A[i][j + 1];
        B[i][j + 2] = A[i][j + 2];
    }
```

In C a two-dimensional array is stored by rows. `A[i][j]` and `A[i][j + 1]` occupy neighboring `int` cells, 4 bytes apart, because an `int` is 4 bytes. `A[i][j]` and `A[i + 1][j]` are one whole row apart: $2049$ ints.

![Row-major order makes the j-inner loop walk neighboring cells, and the i-inner loop jump by a whole row.](../assets/figures/loop-stride.svg)

The first loop holds the row fixed and walks `j`. Consecutive iterations touch consecutive cells. The second loop is slower. It holds the column fixed and walks `i`, so consecutive iterations jump $2049 \times 4$ bytes. The machine's faster memory is used well when the next access is near the previous one. A jump of a whole row keeps missing that neighborhood.

The third loop walks the same row-major order and copies three adjacent ints per iteration. Because $2049 = 3 \times 683$, every element is copied once and there is no leftover tail. This version may be faster than the first: the same adjacent bytes are moved, with fewer trips around the loop. How large the gap is depends on the CPU and its memory, which is why cache design is its own topic. The fact already visible here is the stride.

:::problem id=worked-row-major title="Which copy walks neighboring ints" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
For the three copy loops on a 2049 by 2049 `int` matrix, name the stride of the inner loop and how the speeds compare.

:::solution
With `i` outer and `j` inner, the inner stride is one `int` (4 bytes). With `j` outer and `i` inner, the inner stride is one row, $2049$ ints. The column-wise loop is slower than the row-wise loop. The third loop keeps the row-wise stride and copies three adjacent ints per trip. $2049 = 3 \times 683$, so the unroll covers each row exactly. That version may be faster than the plain row-wise loop.
:::
:::

:::trap
Assuming that two loops with the same assignments have the same cost. Here the assignments are the same and the order of addresses is different. The order is the thing the memory system sees.
:::

## What the course will control

Five layers of control sit ahead. The work starts with the first two: representation, and the layout of memory.

- Data representation and layout
- Memory and cache access
- CPU execution
- Multicore parallelism
- GPU parallelism, at a much larger scale

The topics ahead are C programming, interaction with the OS, code optimization, cache design and coherence, C threads, OpenMP, and GPU architecture with an introduction to CUDA.

The tools for the work are Linux (any distribution; Linux Mint is a fine one to try), `gcc`, `gdb`, and an editor. VS Code is one option, and no editor is required. The book is *Computer Systems: A Programmer's Perspective*, Bryant and O'Hallaron, Prentice Hall, 3rd edition (2016).

## How the course is run

Dr. Marina Kogan-Sadetsky (sadetsky@bgu.ac.il) teaches the course. The TAs are עידן מרדכי גולדברג, נור עתאמנה, and סעיד נעאמנה.

Four assignments are 20% of the grade. The final exam is 80%. Passing the course requires an assignments average of at least 56 and an exam grade of at least 56.

Extensions follow the university guidelines (תקנון). Each student has 5 grace days in total. With no grace days left, a hand-in is penalized 10% on the first late day, an additional 20% on the second, and an additional 30% on the third. You do not need to notify the staff. Unused grace days are not a bonus.

Sharing code, by copying, retyping, looking, or supplying a file, is cheating. Sharing assignment answers is cheating. Using AI to solve an assignment is cheating. The minimal punishment is a failing grade. Helping someone use a tool, talking about high-level design, and using AI to debug your own code are allowed.

## Practice

:::problem id=prac-square-sign title="When a square is negative" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Multiplying $1410065407$ by itself in a 32-bit signed `int` produces a negative result. Answer from the representation.

:::check id=prac-square-sign-q1
The low 32 bits of the mathematical product are {{=0xBAF83801|0x1B97CE2C|0x00000000}}.

The full product is `0x1B97CE2CBAF83801`. A 32-bit cell keeps the low half, `0xBAF83801`.
:::

:::check id=prac-square-sign-q2
Why is the stored product negative?

- [x] The high bit of the stored 32-bit pattern is 1
- [ ] Multiplication of odd integers is defined to return a negative `int`
- [ ] The compiler detected overflow and substituted $-1$

`0xBAF83801` has its top bit set, so a signed 32-bit reading is $-1158137855$.
:::
:::

:::problem id=prac-float-add title="Which association keeps 3.14" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use $x = 1.0\times 10^{20}$, $y = -1.0\times 10^{20}$, and $z = 3.14$.

:::check id=prac-float-add-q1
$(x + y) + z$ evaluates to {{=3.14|0.0|1e20}}.

$x + y$ cancels to 0, and then $z$ is added to 0.
:::

:::check id=prac-float-add-q2
$x + (y + z)$ evaluates to {{=0.0|3.14|-3.14}}.

$3.14$ is lost beside $-10^{20}$, so the inner sum is still $-10^{20}$, and adding $x$ cancels it.
:::

:::check id=prac-float-add-q3
The algebraic property that fails for these machine values is {{=associativity of addition|commutativity of addition|closure of addition}}.

The same three numbers, added, give different results when only the parentheses change.
:::
:::

:::problem id=prac-loop-stride title="Stride of the slower copy" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Both loops assign `B[i][j] = A[i][j]` for `i` and `j` from 0 to 2048. `int` is 4 bytes.

:::check id=prac-loop-stride-q1
In the loop with `j` inner, consecutive inner-loop iterations step {{=4 bytes|2049 bytes|2049 times 4 bytes}}.

`j` and `j + 1` are neighboring columns in the same row, one `int` apart.
:::

:::check id=prac-loop-stride-q2
In the loop with `i` inner, consecutive inner-loop iterations step {{=2049 times 4 bytes|4 bytes|1 byte}}.

The next row starts 2049 ints later, and each `int` is 4 bytes.
:::

:::check id=prac-loop-stride-q3
The column-inner loop is slower because

- [x] Consecutive accesses jump a whole row instead of visiting neighboring cells
- [ ] It performs more assignments than the row-inner loop
- [ ] The index `i` is illegal when it is the inner variable

Both loops perform the same number of assignments. The addresses those assignments touch are in a different order.
:::
:::

:::problem id=prac-no-magic title="What C is for in this course" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-no-magic-q1
C, in this course, is {{=the window into the machine|the language the GPU runs|a replacement for the operating system}}.

C is the window. The machine, the OS, and later the GPU are what the window is for.
:::

:::check id=prac-no-magic-q2
Which of these belong to C, against Python and Java?

- [x] Explicit memory management
- [x] Direct access to addresses
- [ ] Automatic memory management
- [ ] Implementation details hidden by default

The C column is explicit memory, addresses, control of representation, and a close interaction with the OS and the hardware.
:::
:::

This chapter is the reason the rest of the guide watches bytes. It unlocks [Bytes, variables, and pointers](topic:memory-and-pointers), where a variable becomes an address as well as a value.
