---
id: source-to-process
title: Programs and processes
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/01-program/lesson.md
  - c/09-build/lesson.md
---

`gcc main.c -o main` is a driver command. It runs several translators and then the linker. The resulting executable is a file. A process is an execution of that file, with its own virtual address space and a process identifier. The section names in this lesson are the usual ELF names. C defines storage durations and linkage, not section names.

## Translation

:::definition id=def-pipeline title="Translation and linking" source="Lecture 1 - Introduction.pdf"
For one C source file, preprocessing produces a translation unit, translation produces assembly or another intermediate form, assembly produces an object file, and linking combines object files and libraries into an executable.
:::

| Stage | Result |
| --- | --- |
| Preprocessor | A translation unit, after header inclusion and macro expansion |
| Compiler | Assembly or an equivalent intermediate representation |
| Assembler | A relocatable object file |
| Linker | An executable or another linked image |

![Preprocessing, compilation, assembly, and linking, with the GCC options that stop after each stage.](../assets/figures/compile-pipeline.svg)

The same path can be stopped early:

```text
gcc -E main.c -o main.i
gcc -S main.c -o main.s
gcc -c main.c -o main.o
gcc main.o -o main
```

`-E` stops after preprocessing, `-S` after assembly text is written, and `-c` after the object file is written. The last command links. `gcc main.c -o main` performs the whole sequence and removes the intermediate files.

A source file plus the headers it includes is one translation unit. A declaration gives a name a type. Exactly one definition must be linked for an external function or object that the program uses. A header normally contains declarations, not the sole definition of a function.

`int main(void)` is the program's C entry function. Returning 0 reports success to the host. The shell does not print that status unless it is asked, for example with `echo $?`.

The following Linux x86-64 assembly is a freestanding program. It does not call `printf`, and it does not show the normal output of `gcc -S` for a hosted C program:

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

The first `syscall` is Linux `write`: the system-call number 1 is in `%rax`, file descriptor 1 is in `%rdi`, the buffer address is in `%rsi`, and the length 5 is in `%rdx`. The second is `exit`, number 60, with status 0. A system call is a request to the kernel. It is not a function body stored in the C library. A hosted call to `printf("Hello\n")` is compiled as a call to the library function; that function may later perform a `write` system call.

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
In a typical ELF object, `.bss` reserves space for zero-initialized objects with static storage duration. The file does not store all of those zeros. `int x;` with no initializer is a common member.
:::

:::definition id=def-data title=".data" source="Lecture 1 - Introduction.pdf"
`.data` typically holds statically allocated objects whose initial representation is not all zeros. `int y = 10;` is a common member.
:::

:::definition id=def-rodata title=".rodata" source="Lecture 1 - Introduction.pdf"
`.rodata` is a common read-only section for string literals and other immutable static data. Compilers often place a `const` object with static storage there. The `const` qualifier itself does not require that placement, and a string literal must not be modified even when its actual section differs.
:::

:::definition id=def-text title=".text" source="Lecture 1 - Introduction.pdf"
`.text` typically contains executable machine instructions.
:::

:::definition id=def-stack title="Automatic storage" source="Lecture 1 - Introduction.pdf"
An object with automatic storage duration is created on entry to its block. Implementations commonly place it in a stack frame or a register. Taking its address prevents the register-only choice.
:::

:::definition id=def-heap title="Allocated storage" source="Lecture 1 - Introduction.pdf"
`malloc`, `calloc`, and `realloc` create objects with allocated storage duration. `free` ends that lifetime. The usual name for this region is the heap.
:::

![A common placement of the sample objects. Section names and stack allocation are implementation choices.](../assets/figures/program-sections.svg)

`y` belongs in initialized static data because its initializer is nonzero. `x` is zero-initialized static data. A compiler may place `z` in read-only static data, but that is a placement choice. `a` has automatic storage. The instructions of `main` are code, whichever section contains them. The format string is a string literal and must be treated as immutable.

:::problem id=worked-place-each-variable title="Place x, y, z, and a" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
Using ordinary ELF placement, identify the storage of `x`, `y`, `z`, the format string, `a`, and the instructions of `main`.

:::solution
`x` is zero-initialized static storage, commonly `.bss`. `y` is initialized static storage, commonly `.data`. `z` is `const` static storage and is often placed in `.rodata`; `const` does not guarantee that section. The format string is a string literal and is also commonly in `.rodata`. `a` has automatic storage, commonly a stack slot if its address is needed. The instructions are commonly in `.text`.
:::
:::

:::trap
Putting every file-scope object in `.data`. An object with no initializer, or an initializer that is all zeros, is normally zero-initialized storage. A block-scope object without `static` has automatic storage even when it has an initializer.
:::

## Address space and execution

:::definition id=def-address-space title="Process address space" source="Lecture 1 - Introduction.pdf"
A process executes against a virtual address space. A conventional drawing, from high addresses to low addresses, shows a downward-growing stack, unused address space, an upward-growing heap, static data, and code. The actual mapping is chosen by the platform and the loader.
:::

![A conventional address-space drawing. Growth directions and the order of regions are platform conventions.](../assets/figures/address-space.svg)

The loader creates the address space, maps the executable's loadable segments, prepares the initial stack, and transfers control to the executable entry point. On Linux that symbol is commonly `_start`, supplied by the C runtime. The runtime performs startup work and then calls `main`. The kernel does not search the program for a function named `main`.

:::definition id=def-process title="Process" source="Lecture 1 - Introduction.pdf"
A process is a running instance of a program. The operating system records it in its process table and assigns it a process identifier.
:::

While the process is runnable, the scheduler assigns it CPU time. The CPU fetches instructions from the process image and executes them. The operating system also services requests such as I/O and additional mappings. Termination removes the process record and releases its resources.

:::definition id=def-lifecycle title="Process lifetime" source="Lecture 1 - Introduction.pdf"
Creation builds the address space and loads the executable. Execution begins at the image entry point; hosted C then calls `main`. Termination reclaims the process and its resources.
:::

`malloc` and `free` belong to allocated storage. They do not change the distinction between an executable file and a process. Ownership, leaks, and use after `free` are later material.

:::check id=chk-bss
In ordinary ELF placement, a file-scope `int x;` with no initializer is placed in which region?

- [ ] The stack, beside the automatic objects of `main`
- [x] Zero-initialized static storage, commonly `.bss`
- [ ] `.data`, because every file-scope object is stored with an explicit image

`x` has static storage duration and is zero-initialized. `.data` is the usual section for nonzero initialized static data. Automatic objects are the stack or register case.
:::

## Practice

:::problem id=prac-pipeline-order title="Order of the four stages" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-pipeline-order-q1
The stage that handles `#include` and `#define` is the {{=preprocessor|compiler|linker}}.

Preprocessing expands directives and produces the translation unit. Its output is still C text.
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
The processor repeats this cycle: fetch the next instruction, receive it from the process image, then {{=execute it|link it|preprocess it}}.

Fetch and execute describe the running process. Linking and preprocessing are build steps.
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

[Command-line arguments](topic:command-line-arguments) are supplied by the host when it calls `main`. Their storage is separate from the string literals of the program.
