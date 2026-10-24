---
id: source-to-process
title: Programs and processes
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/01-program/lesson.md
  - c/09-build/lesson.md
---

`gcc main.c -o main` looks like one step, but `gcc` is a driver that runs four tools in turn. The result is an executable file. A process is that file being run: it has its own virtual address space and a process identifier (PID). The section names in this lesson (`.text`, `.data`, and so on) are those of ELF, the executable format used by Linux; the C standard itself speaks only of storage durations and linkage.

## Translation

:::definition id=def-pipeline title="Translation and linking" source="Lecture 1 - Introduction.pdf"
For each C source file, the preprocessor produces a translation unit, the compiler turns it into assembly, and the assembler turns that into an object file. The linker then combines the object files and libraries into one executable.
:::

| Stage | Result |
| --- | --- |
| Preprocessor | C source with headers included and macros expanded (the translation unit) |
| Compiler | Assembly code for the target CPU |
| Assembler | A relocatable object file of machine code |
| Linker | An executable, with every external reference resolved |

![Preprocessing, compilation, assembly, and linking, with the GCC options that stop after each stage.](../assets/figures/compile-pipeline.svg)

The same path can be stopped early:

```text
gcc -E main.c -o main.i
gcc -S main.c -o main.s
gcc -c main.c -o main.o
gcc main.o -o main
```

`-E` stops after preprocessing, `-S` after writing assembly, and `-c` after writing the object file. The last command links the object file into an executable. Plain `gcc main.c -o main` runs all four steps and deletes the intermediate files.

A declaration tells the compiler a name's type, for example `int add(int, int);`. A definition also creates the function body or the object's storage. Headers normally hold declarations; each external function or object the program uses must be defined exactly once among the linked files, or the linker reports an error.

`int main(void)` is where a C program starts. Returning 0 from `main` reports success to the shell, which you can display with `echo $?`.

The following Linux x86-64 assembly prints `Hello` without the C library. It is a hand-written program, not what `gcc -S` produces for a C program:

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

The first `syscall` asks the kernel to `write`: `%rax` holds the system-call number 1, `%rdi` the file descriptor 1 (standard output), `%rsi` the address of the text, and `%rdx` its length, 5. The second `syscall` is `exit` (number 60) with status 0. A system call is a request to the operating system kernel, not an ordinary function call. In a normal C program, `printf("Hello\n")` calls the C library's `printf`, which eventually makes the same `write` system call.

:::problem id=worked-stop-the-pipeline title="Which flag stops where" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
Name the GCC option and output for stopping after preprocessing, after generating assembly, and after assembling.

:::solution
`gcc -E main.c -o main.i` stops after preprocessing. `gcc -S main.c -o main.s` stops after writing assembly. `gcc -c main.c -o main.o` stops after writing an object file. `gcc main.o -o main` links that object file.
:::
:::

## Static storage in a typical ELF image

```c
#include <stdio.h>

int x;            /* zero-initialized static storage */
int y = 10;       /* explicitly initialized static storage */
const int z = 5;  /* const-qualified static storage */

int main(void) {
    int a = 12;          /* automatic storage */
    printf("z = %d", z); /* the literal has static storage */
    return 0;
}
```

:::definition id=def-bss title=".bss" source="Lecture 1 - Introduction.pdf"
`.bss` holds static objects whose initial value is zero, such as `int x;` with no initializer. The executable records only the section's size; the zeros are supplied when the program is loaded.
:::

:::definition id=def-data title=".data" source="Lecture 1 - Introduction.pdf"
`.data` holds static objects with a nonzero initial value, such as `int y = 10;`. The executable stores those initial values.
:::

:::definition id=def-rodata title=".rodata" source="Lecture 1 - Introduction.pdf"
`.rodata` holds read-only data: string literals and, usually, static `const` objects. Writing to it typically crashes the program. Modifying a string literal is undefined behavior wherever it is stored.
:::

:::definition id=def-text title=".text" source="Lecture 1 - Introduction.pdf"
`.text` holds the program's machine instructions.
:::

:::definition id=def-stack title="Automatic storage" source="Lecture 1 - Introduction.pdf"
A local variable declared without `static` has automatic storage: it is created when its block is entered and destroyed when the block ends. Compilers place it in the function's stack frame or keep it in a register; if its address is taken, it must be in memory.
:::

:::definition id=def-heap title="Allocated storage" source="Lecture 1 - Introduction.pdf"
`malloc`, `calloc`, and `realloc` create objects at run time, and `free` destroys them. These objects live in the region called the heap.
:::

![A common placement of the sample objects. Section names and stack allocation are implementation choices.](../assets/figures/program-sections.svg)

Applied to the program above: `x` goes to `.bss` because it starts at zero, `y` goes to `.data` because it starts at 10, and `z` and the string `"z = %d"` usually go to `.rodata`. `a` is a local variable on the stack (or in a register), and the instructions of `main` are in `.text`.

:::problem id=worked-place-each-variable title="Place x, y, z, and a" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Using ordinary ELF placement, identify the storage of `x`, `y`, `z`, the format string, `a`, and the instructions of `main`.

:::solution
`x` is zero-initialized static storage, commonly `.bss`. `y` is initialized static storage, commonly `.data`. `z` is `const` static storage and is often placed in `.rodata`; `const` does not guarantee that section. The format string is a string literal and is also commonly in `.rodata`. `a` has automatic storage, commonly a stack slot if its address is needed. The instructions are commonly in `.text`.
:::
:::

:::trap
Putting every global variable in `.data`. A global with no initializer, or initialized to zero, goes to `.bss`. A local variable without `static` is on the stack even when it has an initializer.
:::

## Address space and execution

:::definition id=def-address-space title="Process address space" source="Lecture 1 - Introduction.pdf"
Each process sees its own virtual address space. The conventional picture, from high addresses to low, shows the stack growing downward, a gap of unused addresses, the heap growing upward, static data, and code. The exact addresses are chosen by the operating system.
:::

![A conventional address-space drawing. Growth directions and the order of regions are platform conventions.](../assets/figures/address-space.svg)

When you run a program, the operating system's loader (the `execve` system call on Linux) creates a new address space, maps the executable's code and data into it, sets up the initial stack with the command-line arguments, and jumps to the executable's entry point. That entry point is not `main`: it is usually `_start`, startup code from the C runtime that GCC links in. `_start` prepares the environment and then calls `main`.

:::definition id=def-process title="Process" source="Lecture 1 - Introduction.pdf"
A process is a running instance of a program. The operating system records it in its process table and assigns it a process identifier.
:::

While the process runs, the operating system's scheduler gives it turns on a CPU. The CPU repeatedly fetches the next instruction from the process's memory and executes it. When the program needs something only the kernel can do, such as I/O, it makes a system call. When the process ends, the operating system reclaims its memory and other resources.

:::definition id=def-lifecycle title="Process lifetime" source="Lecture 1 - Introduction.pdf"
A process goes through three stages. **Creation** builds the address space and loads the executable. **Execution** starts at the entry point, which calls `main`. **Termination** releases the process's memory and resources.
:::

:::check id=chk-bss
In ordinary ELF placement, a file-scope `int x;` with no initializer is placed in which region?

- [ ] The stack, beside the automatic objects of `main`
- [x] Zero-initialized static storage, commonly `.bss`
- [ ] `.data`, because every global variable is stored there

`x` is a global that starts at zero, so it goes to `.bss`. `.data` is for globals with a nonzero initial value, and the stack is for local variables.
:::

## Practice

:::problem id=prac-pipeline-order title="Order of the four stages" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-pipeline-order-q1
The stage that handles `#include` and `#define` is the {{=preprocessor|compiler|linker}}.

The preprocessor carries out `#` directives. Its output is still C source code.
:::

:::check id=prac-pipeline-order-q2
The stage that writes machine code into a relocatable object file is the {{=assembler|preprocessor|loader}}.

The compiler produces assembly. The assembler produces the object file. The loader runs later, when the executable is executed.
:::

:::check id=prac-pipeline-order-q3
`gcc -S main.c -o main.s` stops after {{=compilation to assembly|preprocessing|linking}}.

`-S` requests assembly output and does not assemble or link it.
:::
:::

:::problem id=prac-section-quiz title="Region of each object" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use `int x;`, `int y = 10;`, `const int z = 5;`, a block-scope `int a = 12;`, and `printf("z = %d", z)`. Answer with ordinary ELF placement.

:::check id=prac-section-quiz-q1
`y` is commonly placed in {{=.data|.bss|.text}}.

`y` has static storage duration and a nonzero initializer.
:::

:::check id=prac-section-quiz-q2
`z` is commonly placed in {{=.rodata|.data|the stack}}.

`z` is a `const` object with static storage duration. Compilers commonly use a read-only section. The qualifier does not make that section a language requirement.
:::

:::check id=prac-section-quiz-q3
Which placements match the usual implementation?

- [x] `a` has automatic storage, commonly on the stack when it has an address
- [x] The instructions of `main` are commonly in `.text`
- [ ] `x` has automatic storage because it has no initializer
- [ ] The format string is in `.bss` because it is constant

`x` has static storage and is zero-initialized. A string literal is immutable static data, commonly `.rodata`. Optimization may keep an automatic object in a register when its address is not used.
:::
:::

:::problem id=prac-lifecycle title="Creation, execution, termination" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-lifecycle-q1
During creation the operating system {{=maps the executable into a new address space|asks main for a process identifier|runs the preprocessor}}.

Creation and loading produce a process image. The process identifier names that process. Preprocessing happened before the executable existed.
:::

:::check id=prac-lifecycle-q2
Execution of a normal hosted program begins at {{=the executable entry point|a function the kernel selects by the name main|the preprocessor}}.

The loader transfers control to the entry point, commonly `_start`. C runtime code then calls `main`.
:::

:::check id=prac-lifecycle-q3
Termination {{=removes the process and releases its resources|maps .text into memory|runs the linker}}.

Linking finished before execution. Termination ends the process that execution created.
:::
:::

:::problem id=prac-who-fetches title="The instruction cycle and the address space" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-who-fetches-q1
The CPU repeats this cycle: fetch the next instruction from memory, then {{=execute it|link it|preprocess it}}.

Fetching and executing happen while the process runs. Linking and preprocessing happen earlier, when the program is built.
:::

:::check id=prac-who-fetches-q2
In the conventional drawing, which region is at the high addresses and grows downward?

- [x] The stack
- [ ] `.text`
- [ ] The heap, which grows downward toward the stack

Code is commonly mapped at low addresses. The heap commonly grows upward. The drawing is a convention, not a rule that every platform uses the same addresses.
:::

:::check id=prac-who-fetches-q3
The heap is

- [x] The conventional region for objects created by malloc and released by free
- [ ] The section that holds `int y = 10`
- [ ] Another name for `.text`

`y` has static storage. Allocated storage is the heap in the usual vocabulary.
:::
:::

The last lesson, [Command-line arguments](topic:command-line-arguments), looks at the strings the loader places on the initial stack and passes to `main`.
