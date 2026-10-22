---
id: source-to-process
title: From source to a running process
sources:
  - "Lecture 1 - Introduction.pdf"
---

`gcc main.c -o main` looks like one action. Under that command the file is rewritten four times, and then the operating system turns the resulting executable into a process with a stack, a heap, data, and code. The executable is a file. The process is what runs.

## The pipeline

:::definition id=def-pipeline title="The compilation pipeline" source="Lecture 1 - Introduction.pdf"
The pipeline is preprocessor, then compiler, then assembler, then linker. `gcc main.c -o main` runs all four and writes an executable.
:::

| Stage | What it does | Typical file |
| --- | --- | --- |
| Preprocessor | Handles `#include`, `#define`, and the rest of the directives | preprocessed C |
| Compiler | Translates C and optimizes | assembly |
| Assembler | Produces machine code in an object file | object file |
| Linker | Combines object files and libraries | executable |

![Preprocessor, compiler, assembler, and linker, and the gcc flags that stop after each stage.](../assets/figures/compile-pipeline.svg)

The same pipeline, seen from the programmer, is four sentences:

1. The programmer writes the program in a source language.
2. The compiler converts the program into machine language, as one or more object files.
3. The linker links the object files into an executable file.
4. The loader loads code and data from the executable into RAM, and an initial stack is allocated.

A tiny Hello program, lowered all the way to system calls, looks like this:

```text
.section .rodata
msg: .ascii "Hello"
.section .text
.globl _start
_start:
    mov $1, %rax
    mov $1, %rdi
    lea msg(%rip), %rsi
    mov $5, %rdx
    syscall
    mov $60, %rax
    mov $0, %rdi
    syscall
```

Read it as a fully lowered Hello, so you can see a message and instructions in one listing. `msg` sits in `.rodata`. The first `syscall` is Linux `write`: `rax` is 1, `rdi` is file descriptor 1 (standard output), `rsi` is the address of the message, `rdx` is the length 5. The second `syscall` is `exit`: `rax` is 60 and `rdi` is the status 0. A real `gcc -S` of `printf("Hello")` emits a call to `printf`. The `write` and `exit` system calls live in the C library, which the linker attaches. Both listings are the same pipeline: source text becomes instructions, and the link finishes the executable.

## Stopping after each stage

:::algorithm id=alg-gcc-stops title="Run the pipeline one stage at a time" source="Lecture 1 - Introduction.pdf" complexity="Four stops for one translation unit" invariant="Each command writes only the result of the stages up to the stop you asked for."
```text
gcc -E main.c -o main.i    /* stop after preprocessing */
gcc -S main.c -o main.s    /* stop after compilation to assembly */
gcc -c main.c -o main.o    /* stop after assembling */
gcc main.o -o main         /* link the object file */
```
:::

`gcc main.c -o main` is the same four stages with no intermediate files kept. The flags exist so you can open the preprocessed source, the assembly, or the object file and see the stage that produced it.

:::problem id=worked-stop-the-pipeline title="Which flag stops where" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Name the flag and the output file for stopping after preprocessing, after compilation, and after assembling.

:::solution
`gcc -E main.c -o main.i` stops after the preprocessor. `gcc -S main.c -o main.s` stops after the compiler has written assembly. `gcc -c main.c -o main.o` stops after the assembler has written an object file. `gcc main.o -o main` links.
:::
:::

## Sections of the process image

The loader maps the executable into RAM. The next program is small enough to place every line.

```c
#include <stdio.h>

int x;            /* .bss  */
int y = 10;       /* .data */
const int z = 5;  /* .rodata */

int main() {
    int a = 12;              /* stack */
    printf("z = %d", z);     /* the literal also lives in .rodata */
    return 0;
}
```

:::definition id=def-bss title="bss" source="Lecture 1 - Introduction.pdf"
`.bss` (block started by symbol) contains global variables that are initialized to zero, or that have no explicit initializer in the source. The global `int x;` with no initializer belongs here.
:::

:::definition id=def-data title="data" source="Lecture 1 - Introduction.pdf"
`.data` contains global and static variables that are initialized with nonzero values. The global `int y = 10;` belongs here.
:::

:::definition id=def-rodata title="rodata" source="Lecture 1 - Introduction.pdf"
`.rodata` (read-only data) contains immutable global variables initialized with nonzero values, string literals, and constants stored by the compiler. The global `const int z = 5` and the format string belong here.
:::

:::definition id=def-text title="text" source="Lecture 1 - Introduction.pdf"
`.text` contains the code, the machine instructions of the program.
:::

:::definition id=def-stack title="Stack allocation of locals" source="Lecture 1 - Introduction.pdf"
Local variables are allocated on the stack. The local `int a = 12;` belongs here.
:::

:::definition id=def-heap title="Heap" source="Lecture 1 - Introduction.pdf"
The heap contains dynamic allocations. `malloc` and `free` allocate and release memory in this region.
:::

![Each line of the program lands in bss, data, rodata, the stack, or text.](../assets/figures/program-sections.svg)

`const int z = 5` is initialized and immutable, so it belongs in `.rodata` rather than in `.data`. `int x` with no initializer goes to `.bss`, which is the zero-filled region, distinct from a local on the stack. The instructions of `main` are `.text` even though the source line `int a = 12` also causes a stack slot to exist while `main` runs.

:::problem id=worked-place-each-variable title="Place x, y, z, and a" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Name the region that holds `x`, `y`, `z`, the format string, `a`, and the instructions of `main`.

:::solution
`x` is `.bss`. `y` is `.data`. `z` and the string `"z = %d"` are `.rodata`. `a` is on the stack. The instructions are `.text`.
:::
:::

:::trap
Putting every global in `.data`. A global with no initializer, or an initializer of zero, is `.bss`. A `const` global with a nonzero initializer is `.rodata`. A local, even one with an initializer, is the stack.
:::

## The address space

:::definition id=def-address-space title="Process address space" source="Lecture 1 - Introduction.pdf"
A process has a structured address space. From high addresses toward low addresses, the conceptual picture is the stack, free space, the heap, global and static data, and code in `.text`.
:::

![High addresses hold the stack, then free space, the heap, global data, and code at low addresses.](../assets/figures/address-space.svg)

The stack grows downward, toward lower addresses, and holds function calls and local variables. The heap grows upward and holds dynamically allocated memory. Between them there is free space. Global and static data sit below the heap. Code sits at the low end. This is a programmer's conceptual view, and the exact layout can vary. What you should be able to draw is the order and the direction of growth.

The summary of how a run starts:

```text
./main
  → operating system
  → loader
  → create an address space
  → map code and data
  → set up the stack
  → start execution
```

## What the operating system does

:::definition id=def-process title="Process" source="Lecture 1 - Introduction.pdf"
A process is the running image of a program. The OS registers it in the process table and gives it a PID, a process identifier.
:::

While the process exists, the OS allocates CPU time and serves requests: more memory, I/O devices, and the rest. The CPU runs the process's instructions one by one. The cycle is three steps.

:::algorithm id=alg-fetch title="Fetch and execute one instruction" source="Lecture 1 - Introduction.pdf" complexity="One instruction per trip around the cycle" invariant="The instruction executed on a trip is the instruction the CPU just fetched from the process image."
```text
1. Request the next instruction.
2. Get that instruction from the process image.
3. Execute it.
```
:::

Termination removes the process from the process table and frees the memory allocated for it.

The lifecycle has three phases, in this order.

:::definition id=def-lifecycle title="Process lifecycle" source="Lecture 1 - Introduction.pdf"
Creation: the OS builds the process image, allocates memory, and loads instructions and data from the executable. Execution: the OS identifies `main` and runs it, and serves the process's requests for resources. Termination: the OS removes the process and releases its resources.
:::

Dynamic memory comes next: `malloc`, `calloc`, `realloc`, and `free`. Four questions stay open until then: who owns the allocated memory, how long it lives, what happens if it is never released, and what happens if it is used after it was released. In C, memory management is part of the program.

:::check id=chk-bss
A global `int x;` with no initializer is placed in which region?

- [ ] The stack, beside `main`'s locals
- [x] `.bss`
- [ ] `.data`, because every global is initialized storage

`.bss` is the home for globals that are zero or that have no explicit initializer. `.data` is for globals initialized with a nonzero value.
:::

## Practice

:::problem id=prac-pipeline-order title="Order of the four stages" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-pipeline-order-q1
The stage that handles `#include` and `#define` is the {{=preprocessor|compiler|linker}}.

That is the first stage. Its output is still C, with the directives expanded.
:::

:::check id=prac-pipeline-order-q2
The stage that writes machine code into an object file is the {{=assembler|preprocessor|loader}}.

The compiler writes assembly. The assembler turns that assembly into the object file. The loader runs later, on the executable.
:::

:::check id=prac-pipeline-order-q3
`gcc -S main.c -o main.s` stops after {{=compilation to assembly|preprocessing|linking}}.

`-S` stops after the compiler. The file `main.s` is assembly.
:::
:::

:::problem id=prac-section-quiz title="Region of each object" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use `int x;`, `int y = 10;`, `const int z = 5;`, and `int a = 12;` inside `main`, plus `printf("z = %d", z)`.

:::check id=prac-section-quiz-q1
`y` lives in {{=.data|.bss|.text}}.

`y` is a global initialized with a nonzero value.
:::

:::check id=prac-section-quiz-q2
`z` lives in {{=.rodata|.data|the stack}}.

`z` is an immutable global initialized with a nonzero value, which is the description of `.rodata`.
:::

:::check id=prac-section-quiz-q3
Which placements are right?

- [x] `a` is on the stack
- [x] The instructions of `main` are in `.text`
- [ ] `x` is on the stack because it has no initializer
- [ ] The format string is in `.bss` because it is constant

Locals are the stack. Code is `.text`. An uninitialized global is `.bss`. A string literal is `.rodata`.
:::
:::

:::problem id=prac-lifecycle title="Creation, execution, termination" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-lifecycle-q1
During creation the OS {{=loads instructions and data from the executable into allocated memory|asks main for a PID|frees the process image}}.

Creation builds the image. The PID is how the process table entry is named. Freeing memory is termination.
:::

:::check id=prac-lifecycle-q2
During execution the OS identifies {{=main|the preprocessor|.bss}} and runs it.

The OS finds `main` and runs it, and serves requests for resources.
:::

:::check id=prac-lifecycle-q3
Termination {{=removes the process and releases its resources|maps .text into RAM|runs the linker}}.

The linker has already finished before the process exists. Termination undoes the process, not the build.
:::
:::

:::problem id=prac-who-fetches title="The instruction cycle and the address space" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-who-fetches-q1
The cycle is request the next instruction, get it, then {{=execute it|link it|preprocess it}}.

Those three steps are how the CPU runs the instructions already loaded in the process.
:::

:::check id=prac-who-fetches-q2
Which region sits at the high addresses and grows downward?

- [x] The stack
- [ ] `.text`
- [ ] The heap, which grows downward toward the stack

Code is drawn at the low addresses. The heap grows upward. The stack is the high region and grows down.
:::

:::check id=prac-who-fetches-q3
The heap is

- [x] The region of dynamic allocations, taken up with malloc and free
- [ ] The region that holds `int y = 10`
- [ ] A synonym for `.text`

`y` is `.data`. The heap is named here and then postponed, together with `malloc` and `free`.
:::
:::

The regions explain the widths you are about to measure. [Data types and sizeof](topic:c-data-types) says how many bytes each C type occupies in those regions. Those four questions about ownership and lifetime are the subject of dynamic memory, so they stay open here.
