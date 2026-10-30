---
id: source-to-process
title: Programs and processes
sources:
  - "Lecture 1 - Introduction.pdf"
  - "ps1 (1).pdf"
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

## Building on your own computer

The course's work is done on **Linux**. On Windows you can use **WSL** (the Linux system built into Windows) or install Linux next to Windows. The course recommends **VS Code** for writing code. You can also use the Linux computers in the university labs.

To check that everything works, save the "Hello, world" program from [Printing and reading values](topic:printf-and-scanf) as `hello.c`, and type in a terminal:

```text
$ gcc -std=c11 -Wall -Wextra hello.c -o hello
$ ./hello
Hello, world!
```

(The `$` is the terminal's prompt; you do not type it.) The options mean:

| Option | Meaning |
| --- | --- |
| `-std=c11` | use the C11 version of the C language rules |
| `-Wall -Wextra` | turn on extra **warnings**: messages about code that compiles but looks wrong |
| `-o hello` | name the runnable program `hello` (without it, gcc calls it `a.out`) |

Then `./hello` runs the program: `./` means "the file in this folder". Always build with `-Wall -Wextra`, and read every warning. Most warnings point at a real bug.

## A program in several files

Real programs are split into several `.c` files. Each one is compiled on its own into an object file, and the linker joins them. The files share their function declarations through a **header file** (`.h`).

```c
/* f.h: the declaration, shared by everyone who uses f */
#ifndef F_H
#define F_H
int f(int x);
#endif
```

```c
/* f.c: the definition (the body) of f */
#include "f.h"
int f(int x) {
    return 2 * x;
}
```

```c
/* main.c: uses f */
#include <stdio.h>
#include "f.h"
int main(void) {
    printf("%d\n", f(5));   /* 10 */
    return 0;
}
```

- `#include "f.h"` with quotes means "a header from my own folder". Angle brackets, as in `<stdio.h>`, mean "a header from the system".
- `main.c` only sees the **declaration** `int f(int x);`. That is enough for the compiler to check the call `f(5)`. The **definition** lives in `f.c`.
- The three lines `#ifndef F_H`, `#define F_H`, and `#endif` are an **include guard**. The first time the preprocessor pastes `f.h` into a file, `F_H` is not defined yet, so it keeps the contents and defines `F_H`. If the same file includes `f.h` a second time (for example through another header), `F_H` is already defined, and the contents are skipped. Without the guard, the same declarations could be pasted twice.

To build:

```text
$ gcc -c main.c          # compile only: makes main.o
$ gcc -c f.c             # compile only: makes f.o
$ gcc main.o f.o -o demo # link the two object files into one program
$ ./demo
10
```

The linker connects the call to `f` in `main.o` with the code of `f` in `f.o`. If `f.c` were left out of the last command, the linker would stop with an "undefined reference to `f`" error.

:::definition id=def-include-guard title="Header file and include guard" source="ps1 (1).pdf"
A header file (`.h`) holds declarations that several `.c` files share through `#include`. An include guard, `#ifndef NAME` / `#define NAME` / `#endif` around its contents, makes sure those contents are pasted only once per `.c` file.
:::

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

Lecture 2 shows how to use the heap, in [Memory on request: malloc and free](topic:malloc-and-free).

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
A file has `#include <stdioo.h>`, with a typing mistake. The step that reports it is the {{=preprocessor|compiler|linker}}.

The preprocessor handles every line starting with `#`, and it cannot find that file. Nothing else gets a chance to run.
:::

:::check id=prac-pipeline-order-q2
A line is missing its `;`. The step that reports it is the {{=compiler|assembler|linker}}.

The compiler is the step that reads C itself. The assembler reads assembly, and the linker reads object files, so neither of them ever sees C.
:::

:::check id=prac-pipeline-order-q3
A file calls `area`, which is declared in a header, but its code is in no file you gave `gcc`. The step that reports it is the {{=linker|compiler|preprocessor}}.

The declaration satisfies the compiler, which only needs to know how to call `area`. Connecting that call to real code is the linker's job, and it finds none.
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
`limit` usually goes to {{=.rodata|.data|.bss}}.

It is a global, and it is `const`, so it usually goes with the fixed text. The non-zero rule only matters for globals you may change.
:::

:::check id=prac-section-quiz-q2
If the second line were `double rate = 0.0;`, then `rate` would usually go to {{=.bss|.data|.rodata}}.

What matters is whether the starting value is zero, not whether you wrote one. All-zero globals usually go to `.bss`.
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
You run the same program twice at the same time, and both copies print the address of a global `x`. They print the same number. What is true?

- [x] Each copy has its own address space, so that number means a different box in each
- [ ] Both copies share one `x`, so a change in one shows in the other
- [ ] This cannot happen, because the operating system gives each copy different addresses

Every process gets its own address space, a private view of memory. The same address number can hold different values in two processes.
:::

:::check id=prac-lifecycle-q2
A running program starts at {{=the executable entry point|a function the kernel selects by the name main|the preprocessor}}.

The loader jumps to the entry point, usually `_start`. That startup code then calls `main`.
:::

:::check id=prac-lifecycle-q3
A program calls `malloc` and ends without calling `free`. After it ends, that memory is {{=taken back by the operating system|reserved until the computer restarts|still full when the program runs again}}.

When a process ends, the operating system takes back everything it used. Leaks hurt while the program runs, especially one that runs for a long time.
:::
:::

:::problem id=prac-who-fetches title="The instruction cycle and the address space" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-who-fetches-q1
While a program runs, the CPU fetches its next instruction from {{=.text in memory|the .c file on disk|the stack}}.

The `.c` file is not needed at run time. The machine code was loaded into `.text`, and the stack holds data, not code.
:::

:::check id=prac-who-fetches-q2
`main` calls `f`, and both have local variables. In the usual picture, `f`'s locals are at {{=lower addresses than main's|higher addresses than main's|the same addresses as main's}}.

The stack starts at the top and grows down, and `f` is called while `main` is still running. So `f`'s locals are placed below `main`'s.
:::

:::check id=prac-who-fetches-q3
`int *p = malloc(8);` runs inside `main`. Where do `p` and the 8 bytes live?

- [x] `p` is on the stack, and the 8 bytes are on the heap
- [ ] Both are on the heap
- [ ] `p` is in `.data`, and the 8 bytes are on the stack

`p` is an ordinary local variable that happens to hold an address. Only the block that `malloc` reserved is on the heap.
:::
:::

**Next:** the last lesson, [Command-line arguments](topic:command-line-arguments), shows how a program receives the words you type after its name, such as `./sum 3 4`.
