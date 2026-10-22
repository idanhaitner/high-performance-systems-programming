---
id: why-low-level
title: Representation and performance
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/03-expressions/lesson.md
---

Performance work starts from a concrete machine model. A mathematical expression names a value. A C expression names an operation on a finite representation, and the generated code then reads and writes memory. Those two steps explain the results in this lesson: a signed overflow, a rounding difference, and an access pattern that walks memory in a different order.

The later lectures move from this model to cache behavior, CPU execution, multicore programs, and GPUs. C is the course language because a C program can name widths, addresses, and layout directly.

![The course proceeds from C to memory, cache and the CPU, multicore execution, and the GPU.](../assets/figures/course-path.svg)

## Where an abstraction spends its time

:::definition id=def-no-magic title="Implementation of an abstraction" source="Lecture 1 - Introduction.pdf"
An abstraction has an implementation in software or hardware. The cost of an operation is the cost of that implementation.
:::

Python and Java hide allocation, object layout, and parts of numeric representation. C leaves allocation and layout under the program's control and maps most operations closely to machine instructions. That difference is a design tradeoff. It does not mean that every higher-level implementation is written in C: a runtime may use C, another language, or a JIT. The useful boundary is which decisions the language lets the program make.

![Application code uses explicit C operations, which become instructions and memory accesses.](../assets/figures/abstraction-stack.svg)

| Decision | Common application language | C |
| --- | --- | --- |
| Storage duration | Often managed by a runtime | Chosen by the program |
| Layout | Hidden by the object model | Chosen by declarations and the ABI |
| Numeric result | A language-defined numeric model | The C type and its representation |

The same algorithm can have different running times once the representation or the memory traffic changes. Compilers, operating systems, embedded software, and reverse engineering all depend on that fact.

:::check id=chk-no-magic
Which statement describes the cost of an abstraction?

- [ ] The cost is fixed by the language name before any implementation is chosen
- [x] The cost is the cost of the software or hardware that implements it
- [ ] The cost appears only after the program has been rewritten by hand in assembly

An abstraction does not have a cost of its own. Its implementation performs instructions and memory accesses, and those operations account for the cost.
:::

## Signed overflow is not modular arithmetic

:::definition id=def-representation-limit title="Finite representation" source="Lecture 1 - Introduction.pdf"
A machine integer has a finite width. A mathematical result that does not fit in that width is not automatically reduced modulo the width of a signed C type.
:::

Consider a 32-bit two's-complement calculation, independent of what a C compiler is allowed to do:

$$1410065407 \times 1410065407 = 1988284452018075649 = \mathtt{0x1B97CE2CBAF83801}$$

The low 32 bits are `0xBAF83801`. Interpreted as a signed 32-bit two's-complement value, that pattern is $-1158137855$. This is a fact about the bit pattern. A signed `int` expression in C is not required to produce it.

:::definition id=def-signed-overflow title="Signed overflow" source="c/03-expressions/lesson.md"
If a signed integer operation has a mathematical result that cannot be represented in the result type, the behavior of the C program is undefined.
:::

Undefined behavior means the C standard imposes no requirements on that execution. A compiler may assume the overflow does not occur, delete later checks, or produce the low 32 bits. Wrapping is the defined rule for unsigned arithmetic. For a 32-bit demonstration, use `uint32_t` from `<stdint.h>`: conversion to `uint32_t` reduces the value modulo $2^{32}$.

```c
#include <stdint.h>

uint32_t x = 1410065407u;
uint32_t product = x * x; /* defined modulo 2^32: 0xBAF83801 */
```

:::problem id=worked-square-overflow title="Square of 1410065407" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Separate the mathematical product, the 32-bit two's-complement reading, and the meaning of the same multiplication in signed C.

:::solution
The mathematical product is $1988284452018075649$, or `0x1B97CE2CBAF83801`. Its low 32 bits are `0xBAF83801`, which reads as $-1158137855$ in 32-bit two's complement. A signed `int` multiplication that cannot represent the product is undefined behavior, so a C program is not required to store that pattern. The defined way to keep the low 32 bits is an unsigned operation, such as multiplication in `uint32_t`.
:::
:::

:::trap
Testing a signed overflow on one compiler and treating the observed wrap as the language rule. Change optimization level, compiler, or surrounding code, and an undefined operation can produce a different result.
:::

## Rounding makes addition non-associative

A binary floating-point format stores a sign, a biased exponent, and a fraction. Values near $10^{20}$ have a large unit in the last place. Under ordinary IEEE-754 `double` evaluation, adding $3.14$ to a magnitude of $10^{20}$ does not change the stored magnitude.

$$
(1.0\times 10^{20} + (-1.0\times 10^{20})) + 3.14 = 3.14
$$

$$
1.0\times 10^{20} + ((-1.0\times 10^{20}) + 3.14) = 0.0
$$

The first association cancels the large values while they are exact opposites, then adds $3.14$ to zero. The second adds $3.14$ to $-10^{20}$ first. That addend is below the unit in the last place, so the inner result remains $-10^{20}$ and the following addition cancels it.

An unsuffixed literal such as `1e20` has type `double`. These two results apply to IEEE-754 evaluation in program order. Flags that permit reassociation, including some fast-math modes, can change which association the compiler emits. The algebraic law that fails here is associativity of addition. Commutativity is not the property being tested.

:::problem id=worked-float-associativity title="Two associations of 1e20 and 3.14" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
For $x = 10^{20}$, $y = -10^{20}$, and $z = 3.14$, evaluate both associations under ordinary IEEE-754 `double` arithmetic and name the law that fails.

:::solution
$(x + y) + z$ evaluates to $3.14$. The other association evaluates to $0.0$. Associativity fails because the format cannot retain $3.14$ beside a magnitude of $10^{20}$. This assumes evaluation in the written order under IEEE-754 rules, without a compiler transformation that reassociates the expression.
:::
:::

## Stride decides which bytes are adjacent

C stores a two-dimensional array in row-major order: `A[i][j]` and `A[i][j + 1]` are adjacent elements. For an `int` array, adjacent elements are `sizeof(int)` bytes apart. On the LP64 platform used for these examples, that distance is 4 bytes. `A[i][j]` and `A[i + 1][j]` are one row apart, which is $2049$ elements in the arrays below.

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

![Row-major order places consecutive columns in adjacent cells and consecutive rows one row apart.](../assets/figures/loop-stride.svg)

The first inner loop advances one element. A hardware cache loads a cache line, commonly 64 bytes, so several consecutive `int` values arrive together and the next iterations reuse that line. The second inner loop advances $2049 \times 4 = 8196$ bytes. Consecutive iterations do not share a cache line, so the pattern has poor spatial locality.

The third loop uses the same row-major order and copies three adjacent elements per iteration. Because $2049 = 3 \times 683$, every element is visited once. Fewer loop-control instructions execute for the same memory traffic. Whether any version is faster is an empirical question: the compiler may reorder or vectorize the loops, and the machine's caches and prefetcher affect the measurement. The access stride is the fact available before measuring.

:::problem id=worked-row-major title="Which copy walks neighboring ints" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
For the three copies of a 2049 by 2049 `int` matrix, give the inner-loop stride and the locality consequence. Do not treat a timing result as portable.

:::solution
With `j` in the inner loop, the stride is one `int`, or 4 bytes on this platform. With `i` in the inner loop, the stride is one row: $2049$ ints, or 8196 bytes. The one-element stride has spatial locality because consecutive accesses share a cache line. The row stride does not. The third loop keeps the one-element stride, visits every element once because $2049$ is divisible by 3, and performs less loop control per element. A compiler or a different cache can change the measured time.
:::
:::

:::trap
Comparing two loops by the number of assignments alone. These copies perform the same number of element assignments. The difference is the distance between successive addresses.
:::

## The scope of this lecture

Five implementation layers account for most of the performance topics in the course:

- Representation and layout
- Memory and cache behavior
- Instruction execution
- Multicore coordination
- GPU parallelism

This lecture covers the first layer and the address-space model needed to talk about the second. The working environment is Linux, GCC, GDB, and an editor. The reference book is *Computer Systems: A Programmer's Perspective*, Bryant and O'Hallaron, 3rd edition (2016).

## Practice

:::problem id=prac-square-sign title="When a square is negative" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use $x = 1410065407$. Its mathematical square is `0x1B97CE2CBAF83801`.

:::check id=prac-square-sign-q1
The low 32 bits of that product are {{=0xBAF83801|0x1B97CE2C|0x00000000}}.

A 32-bit pattern retains bits 31 through 0. In `0x1B97CE2CBAF83801`, those bits are `0xBAF83801`.
:::

:::check id=prac-square-sign-q2
Why does a two's-complement reading of those 32 bits have a negative sign?

- [x] The high bit of the stored 32-bit pattern is 1
- [ ] Multiplication of odd integers is defined to return a negative value
- [ ] The C standard substitutes $-1$ for every signed overflow

`0xBAF83801` has bit 31 set. A signed 32-bit two's-complement interpretation is therefore negative. That interpretation is a fact about the pattern, not a C rule for signed overflow.
:::

:::check id=prac-square-sign-q3
In ISO C, signed overflow of `int` is {{=undefined behavior|defined reduction modulo 2^32|required to produce this negative value}}.

The standard imposes no requirements on a signed operation whose result cannot be represented. Unsigned arithmetic, including `uint32_t`, has the modular rule.
:::
:::

:::problem id=prac-float-add title="Which association keeps 3.14" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use $x = 1.0\times 10^{20}$, $y = -1.0\times 10^{20}$, and $z = 3.14$, evaluated as IEEE-754 `double` values in the written order.

:::check id=prac-float-add-q1
$(x + y) + z$ evaluates to {{=3.14|0.0|1e20}}.

$x + y$ cancels to 0, and adding $z$ to 0 retains $3.14$.
:::

:::check id=prac-float-add-q2
$x + (y + z)$ evaluates to {{=0.0|3.14|-3.14}}.

$3.14$ is lost beside $-10^{20}$, so the inner sum remains $-10^{20}$. Adding $x$ then cancels that value.
:::

:::check id=prac-float-add-q3
The algebraic property that fails for these machine values is {{=associativity of addition|commutativity of addition|closure of addition}}.

The same three numbers produce different results when only the association changes. A fast-math transformation can reassociate the source expression, so the result is tied to the evaluation order.
:::
:::

:::problem id=prac-loop-stride title="Stride of the column-wise copy" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Both loops assign `B[i][j] = A[i][j]` for every `i` and `j` from 0 through 2048. On this platform, `int` is 4 bytes.

:::check id=prac-loop-stride-q1
In the loop with `j` inner, consecutive inner-loop iterations step {{=4 bytes|2049 bytes|8196 bytes}}.

`j` and `j + 1` name adjacent elements of one row. Each element occupies 4 bytes here.
:::

:::check id=prac-loop-stride-q2
In the loop with `i` inner, consecutive inner-loop iterations step {{=8196 bytes|4 bytes|1 byte}}.

The next row begins 2049 ints later, and each `int` occupies 4 bytes: $2049 \times 4 = 8196$.
:::

:::check id=prac-loop-stride-q3
The column-wise pattern has worse spatial locality because

- [x] Consecutive accesses are a whole row apart and do not share a cache line
- [ ] It performs more assignments than the row-wise loop
- [ ] The index `i` is illegal when it is the inner variable

Both loops perform the same assignments. The row-wise addresses are adjacent. The column-wise addresses jump 8196 bytes, which is much larger than a typical 64-byte cache line. Measured time still depends on the compiler and the machine.
:::
:::

:::problem id=prac-no-magic title="What C exposes in this course" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-no-magic-q1
C is used here because it {{=exposes representation, addresses, and layout|is the language every GPU executes|replaces the operating system}}.

The course studies machine behavior. C can name the widths and addresses involved. A GPU programming model and the operating system are separate layers.
:::

:::check id=prac-no-magic-q2
Which statements describe C, as compared with a managed application language?

- [x] Storage duration is explicit
- [x] Addresses and object layout are visible
- [ ] A runtime reclaims every allocation automatically
- [ ] Object layout is hidden by default

C gives the program control of allocation and representation. It does not provide the managed object model of Python or Java.
:::
:::

The next lesson, [Values and types](topic:c-data-types), fixes the widths and conversions used by the examples above.
