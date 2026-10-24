---
id: source-to-process
title: Programs and processes
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/01-program/lesson.md
  - c/09-build/lesson.md
---

So far we have written C code. But a computer's processor (the **CPU**) cannot read C. It only understands **machine code**: instructions written as numbers. This lesson follows your program on its journey: from a text file you wrote, to a file of machine code, to a **running program** in memory. Along the way we see where each kind of variable ends up, which ties together everything from the earlier lessons.

## From C file to runnable program: four steps

You build a program with a command like this:

```text
gcc main.c -o main
```

This means: "take my C file `main.c` and produce a runnable program called `main`." It looks like one step, but `gcc` actually runs **four tools in a row**, each one passing its result to the next:

| Step | What it does | Result |
| --- | --- | --- |
| 1. Preprocessor | Pastes in `#include` files and replaces `#define` names | C code, with everything expanded |
| 2. Compiler | Translates C into assembly | Assembly code (human-readable machine instructions) |
| 3. Assembler | Turns assembly into machine code | An **object file** (`.o`) |
| 4. Linker | Joins object files and libraries together | The **executable**: the program you can run |

:::definition id=def-pipeline title="Translation and linking" source="Lecture 1 - Introduction.pdf"
Each C file goes through the preprocessor, the compiler, and the assembler, producing an object file. The linker then combines all the object files, plus library code, into one executable.
:::

![Preprocessing, compilation, assembly, and linking, with the GCC options that stop after each stage.](../assets/figures/compile-pipeline.svg)

A few words that just appeared:

- **Assembly** is machine code written with short names instead of numbers, for example `mov` (move a value) or `add`. Each line is one CPU instruction.
- An **object file** is machine code for one C file. It is not runnable yet, because it may call functions that live in other files (like `printf`, which lives in the C library).
- The **linker** connects those calls to the actual code. For example, it links your call to `printf` with the library's `printf`.

### Stopping after each step

You can tell `gcc` to stop early and keep the in-between result, which is useful for seeing what each step does:

```text
gcc -E main.c -o main.i    # stop after step 1 (preprocessed C)
gcc -S main.c -o main.s    # stop after step 2 (assembly)
gcc -c main.c -o main.o    # stop after step 3 (object file)
gcc main.o -o main         # step 4: link into a program
```

Plain `gcc main.c -o main` runs all four and throws away the in-between files.

### Declarations and definitions

Two words you will hear often:

- A **declaration** just announces a name and its type: `int add(int, int);` says "a function called `add` exists, takes two `int`s and returns an `int`." It lets the compiler check your calls.
- A **definition** actually creates it: the function's body, or the variable's memory.

Header files (`.h`) usually contain declarations. Every function or global variable you use must be **defined exactly once** across all your files. If it is missing, or defined twice, the linker reports an error.

### Where the program starts

Every C program has a function `int main(void)`. Your code starts running there. When `main` returns 0, it tells the system "success". In the terminal, `echo $?` shows the value the last program returned.

### A peek at assembly

Just to see what the bottom layer looks like, here is a tiny hand-written assembly program for Linux that prints `Hello`. (This is not what `gcc` would produce from C; it is written by hand to be as small as possible.)

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

You do not need to memorize this. The idea: a program cannot print to the screen by itself. It must ask the **operating system** (its core part is called the **kernel**). Such a request is a **system call**, made with the `syscall` instruction. Before it, the program puts the details into **registers**, which are small storage slots inside the CPU:

- The first `syscall` is "write" (number 1 in `%rax`): write to the screen (`1` in `%rdi`) the text at `msg` (`%rsi`), 5 characters long (`%rdx`).
- The second `syscall` is "exit" (number 60) with status 0.

In normal C, you call `printf("Hello\n")`. `printf` is ordinary library code, and deep inside it eventually makes this same "write" system call.

## Where each variable lives in the program file

The executable is not one big blob. It is divided into **sections**, each holding one kind of thing. (The names below are from **ELF**, the executable file format Linux uses.) Let's place each variable of this program:

```c
#include <stdio.h>

int x;            /* global, no starting value (so it starts at 0) */
int y = 10;       /* global, starts at 10 */
const int z = 5;  /* global, read-only */

int main(void) {
    int a = 12;          /* local variable */
    printf("z = %d", z); /* "z = %d" is fixed text */
    return 0;
}
```

:::definition id=def-text title=".text" source="Lecture 1 - Introduction.pdf"
`.text` holds the program's machine instructions: your compiled code.
:::

:::definition id=def-data title=".data" source="Lecture 1 - Introduction.pdf"
`.data` holds global variables that start with a non-zero value, such as `int y = 10;`. The file stores those starting values.
:::

:::definition id=def-bss title=".bss" source="Lecture 1 - Introduction.pdf"
`.bss` holds global variables that start at zero, such as `int x;`. To save space, the file only records how many bytes are needed. The zeros are filled in when the program starts.
:::

:::definition id=def-rodata title=".rodata" source="Lecture 1 - Introduction.pdf"
`.rodata` ("read-only data") holds things that must not change: fixed text like `"z = %d"` and, usually, `const` globals. Trying to change them typically crashes the program.
:::

Local variables and run-time memory are not in the file at all. They are created while the program runs:

:::definition id=def-stack title="Automatic storage" source="Lecture 1 - Introduction.pdf"
A local variable (declared inside a function, without `static`) is created when the function starts and destroyed when it ends. It lives in the function's area of the **stack**, or the compiler may keep it in a CPU register instead.
:::

:::definition id=def-heap title="Allocated storage" source="Lecture 1 - Introduction.pdf"
Memory you ask for while the program runs, with `malloc` (and give back with `free`), comes from an area called the **heap**.
:::

![A common placement of the sample objects. Section names and stack allocation are implementation choices.](../assets/figures/program-sections.svg)

**Putting it together for our program:**

| Thing | Why | Usually goes to |
| --- | --- | --- |
| `x` | global, starts at 0 | `.bss` |
| `y` | global, starts at 10 | `.data` |
| `z` | global, `const` | `.rodata` |
| `"z = %d"` | fixed text | `.rodata` |
| `a` | local variable | the stack (or a register) |
| the code of `main` | instructions | `.text` |

These are the usual choices, not strict C rules. For example, `const` does not *force* the compiler to use `.rodata`; it just usually does.

:::trap
Putting every global in `.data`. A global with no starting value, or starting at 0, goes to `.bss`. And a local variable lives on the stack even if it has a starting value.
:::

## The running program: a process

A program file just sits on the disk. When you run it, it becomes a **process**.

:::definition id=def-process title="Process" source="Lecture 1 - Introduction.pdf"
A process is a program that is currently running. The operating system keeps a list of all processes and gives each one an ID number, the **PID**.
:::

You can run the same program twice at once; that gives two separate processes, each with its own memory.

### The process's memory layout

Each process gets its **own** range of addresses, called its **address space**. It seems to the process as if it has the whole memory to itself; the operating system keeps processes from seeing each other's memory.

:::definition id=def-address-space title="Process address space" source="Lecture 1 - Introduction.pdf"
Each process has its own private range of addresses. The usual picture, from high addresses at the top to low at the bottom: the **stack** (growing down), a large empty gap, the **heap** (growing up), the global data, and the code. The exact addresses are chosen by the operating system.
:::

![A conventional address-space drawing. Growth directions and the order of regions are platform conventions.](../assets/figures/address-space.svg)

Why does the stack grow down and the heap grow up? So that they grow toward each other into the shared empty gap, and neither runs out of room early.

### What happens when you run a program

When you type `./main`, three stages follow:

:::definition id=def-lifecycle title="Process lifetime" source="Lecture 1 - Introduction.pdf"
A process goes through three stages. **Creation**: the operating system builds a new address space and loads the program into it. **Execution**: the program runs, starting from its entry point, which calls `main`. **Termination**: the process ends and the operating system takes back its memory and other resources.
:::

**1. Creation.** A part of the operating system called the **loader** (on Linux, the `execve` system call) creates a fresh address space, copies the program's code and data into it, and puts the command-line arguments on the stack (more on those in the next lesson).

**2. Execution.** The loader jumps to the program's **entry point**. Surprisingly, this is *not* `main`. It is a small piece of startup code, usually called `_start`, which `gcc` adds automatically. `_start` prepares a few things and then calls your `main`.

While the program runs, the CPU repeats one simple cycle over and over: **fetch** the next instruction from memory, then **execute** it. The operating system's **scheduler** takes turns between processes, so many programs seem to run at once. When the program needs something only the kernel can do, like printing or reading a file, it makes a system call.

**3. Termination.** When `main` returns (or the program calls `exit`), the process ends, and the operating system frees all of its memory.

:::check id=chk-bss
A global written as `int count = 0;` usually goes where?

- [ ] In `.data`, because it has a starting value
- [x] In `.bss`, because its starting value is zero
- [ ] On the stack, because 0 means "nothing"

What matters is whether the starting value is zero, not whether you wrote one. `int count = 0;` and `int count;` both start at 0, so both usually go to `.bss`.
:::

## Practice

:::problem id=prac-pipeline-order title="Order of the four stages" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-pipeline-order-q1
The step that handles `#include` and `#define` is the {{=preprocessor|compiler|linker}}.

The preprocessor handles every line starting with `#`. Its output is still C code.
:::

:::check id=prac-pipeline-order-q2
The step that turns assembly into an object file of machine code is the {{=assembler|preprocessor|loader}}.

The compiler produces assembly, and the assembler turns it into machine code. The loader is used later, when you run the program.
:::

:::check id=prac-pipeline-order-q3
`gcc -S main.c -o main.s` stops after {{=compilation to assembly|preprocessing|linking}}.

`-S` means "give me the assembly". It does not assemble or link.
:::
:::

:::problem id=prac-section-quiz title="Region of each object" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new program:

```c
int hits;                 /* global */
double rate = 1.5;        /* global */
const int limit = 100;    /* global */

int main(void) {
    int i = 0;            /* local */
    puts("done");         /* prints the text "done" */
    return 0;
}
```

:::check id=prac-section-quiz-q1
`rate` usually goes to {{=.data|.bss|.rodata}}.

`rate` is a global with a non-zero starting value (1.5).
:::

:::check id=prac-section-quiz-q2
`hits` usually goes to {{=.bss|.data|the stack}}.

`hits` is a global with no starting value, so it starts at 0.
:::

:::check id=prac-section-quiz-q3
Which of these are correct?

- [x] `i` is a local variable, so it usually lives on the stack (or in a register)
- [x] The text `"done"` and `limit` usually go to `.rodata`
- [ ] `i` goes to `.bss` because it starts at 0
- [ ] `limit` goes to `.data` because it has a non-zero starting value

The zero rule is only for globals; a local is on the stack whatever its value. `limit` is `const`, so it usually goes with the fixed text to `.rodata`.
:::
:::

:::problem id=prac-lifecycle title="Creation, execution, termination" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-lifecycle-q1
During creation, the operating system {{=loads the program into a new address space|asks main for a process ID|runs the preprocessor}}.

Creation builds the process's memory and loads the program into it. The preprocessor ran long before, when the program was built.
:::

:::check id=prac-lifecycle-q2
A running program starts at {{=the executable entry point|a function the kernel selects by the name main|the preprocessor}}.

The loader jumps to the entry point, usually `_start`. That startup code then calls `main`.
:::

:::check id=prac-lifecycle-q3
Termination {{=removes the process and frees its resources|loads .text into memory|runs the linker}}.

At the end, the operating system takes back everything the process used. Linking happened before the program ever ran.
:::
:::

:::problem id=prac-who-fetches title="The instruction cycle and the address space" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-who-fetches-q1
The CPU repeats this cycle: fetch the next instruction from memory, then {{=execute it|link it|preprocess it}}.

Fetch and execute happen while the program runs. Linking and preprocessing happen earlier, when it is built.
:::

:::check id=prac-who-fetches-q2
In the usual picture, which area is at the top (high addresses) and grows downward?

- [x] The stack
- [ ] `.text`
- [ ] The heap

The stack is at the top and grows down. The heap grows up toward it. The code (`.text`) is near the bottom.
:::

:::check id=prac-who-fetches-q3
The heap is

- [x] The area for memory requested with malloc and given back with free
- [ ] The section that holds `int y = 10`
- [ ] Another name for `.text`

`y` is a global with a starting value, so it is in `.data`. The heap is for memory requested while the program runs.
:::
:::

**Next:** the last lesson, [Command-line arguments](topic:command-line-arguments), shows how a program receives the words you type after its name, such as `./sum 3 4`.
