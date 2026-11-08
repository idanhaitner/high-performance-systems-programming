---
id: debugging-tools
title: "Finding memory bugs: GDB and Valgrind"
sources:
  - "ps2.pdf"
---

You now know many ways to break memory: following `NULL`, writing past an array, forgetting `free`. These bugs are hard to find by reading code, because the program may crash far from the mistake, or not crash at all. This last lesson of Lecture 2 shows two free tools that find them for you. **GDB** lets you stop a running program and look inside it. **Valgrind** watches a program run and reports what it did wrong with memory.

## Getting the tools

Both tools run on Linux and on WSL (the Linux system built into Windows). To install them, type:

```text
$ sudo apt install gdb valgrind
```

On macOS, Valgrind does not run on current versions, and GDB does not run on Apple's own chips. The built-in debugger `lldb` does the same job as GDB, with slightly different commands. The exact output in this lesson is typical of Linux on a 64-bit machine, and details such as addresses will differ on yours.

## Step one: build with -g

Normally, the finished program no longer knows your variable names or line numbers. The compiler option `-g` keeps that information in the program file, so the tools can talk about your code:

```text
$ gcc -g buggy.c -o buggy
```

Without `-g`, the tools still run, but they can only show addresses, not lines of your code.

## A crash: which line, and why?

Imagine your program only prints `Segmentation fault`, the message for touching memory it may not use. It says nothing about where. Here is the program, with line numbers on the left:

```c
1  #include <stdio.h>
2
3  int main(void) {
4      int *ptr = NULL;
5      *ptr = 42;
6      printf("%d\n", *ptr);
7      return 0;
8  }
```

Run it inside GDB. `(gdb)` is GDB's prompt, the place where you type its commands:

```text
$ gdb ./buggy
(gdb) run
Program received signal SIGSEGV, Segmentation fault.
main () at buggy.c:5
5	    *ptr = 42;
(gdb) backtrace
#0  main () at buggy.c:5
(gdb) print ptr
$1 = (int *) 0x0
```

Here is what each command gave you:

- `run` starts the program. GDB stops it at the moment of the crash and shows the line: 5. `SIGSEGV` is the operating system's name for a segmentation fault.
- `backtrace` lists the stack frames, with the current function first. It shows how the program got here.
- `print ptr` shows the value of a variable. `0x0` is address 0, which is `NULL`. So the bug is following a `NULL` pointer on line 5.

No guessing and no extra `printf` lines were needed.

:::check id=chk-find-crash-line
A program built with `gcc -g` crashes inside GDB, and you want to see which functions were running when it crashed. Which command shows them?

- [x] `backtrace`
- [ ] `run`
- [ ] `print`

`backtrace` lists the stack frames at that moment, each with its function and line. `run` starts the program, and `print` shows the value of one variable or expression.
:::

## Stopping the program to look around

You do not have to wait for a crash. A **breakpoint** is a spot where GDB pauses the program, so you can look at it and move forward one line at a time. Here is a session with the `add` and `twice` program from [How function calls use the stack](topic:stack-frames):

```text
$ gcc -g trace.c -o trace
$ gdb ./trace
(gdb) break add
Breakpoint 1 at ...: file trace.c, line 4.
(gdb) run
Breakpoint 1, add (a=3, b=3) at trace.c:4
4	    int sum = a + b;
(gdb) backtrace
#0  add (a=3, b=3) at trace.c:4
#1  twice (x=3) at trace.c:9
#2  main () at trace.c:15
(gdb) next
5	    return sum;
(gdb) print sum
$1 = 6
(gdb) finish
Run till exit from #0  add (a=3, b=3) at trace.c:5
Value returned is $2 = 6
```

The `backtrace` is the pile of frames you traced by hand: `add` on top of `twice`, on top of `main`. `next` runs one line. `finish` runs until the current function returns, and shows the value it returned.

## A quiet overwrite: watching a variable

The worst memory bugs do not crash. They silently change another variable. Writing past the end of an array like this is called a **buffer overflow**, where "buffer" just means an array that holds data for a while. Here, the array `buffer` is too small for the text:

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    int authenticated = 0;
    char buffer[8];
    strcpy(buffer, "AAAAAAAAAAA");   /* 11 letters + '\0' = 12 bytes */
    if (authenticated)
        printf("Access granted!\n");
    return 0;
}
```

Nobody ever assigns anything to `authenticated`, yet the program may print `Access granted!`. If the compiler placed `authenticated` right after `buffer`, the last 4 of those 12 bytes land on top of it. Where the two variables go is the compiler's choice. Modern compilers add protections, so to see this effect you may need to build with `gcc -g -fno-stack-protector`.

A **watchpoint** finds this kind of bug: GDB stops the program the moment a chosen variable changes, no matter which line changed it. The variable must exist first, so start the program and stop at `main`:

```text
(gdb) break main
(gdb) run
(gdb) watch authenticated
Hardware watchpoint 2: authenticated
(gdb) continue
Hardware watchpoint 2: authenticated

Old value = 0
New value = 4276545
(gdb) x/2xw buffer
0x7fffffffe400:	0x41414141	0x00414141
```

- If `continue` first stops at the line `authenticated = 0`, type `continue` again.
- `4276545` is `0x00414141`: three bytes holding `'A'`, whose code is `0x41`, and one byte holding the ending `'\0'`.
- `x/2xw buffer` means "examine memory at `buffer`: 2 values, in hex, each a 4-byte word". Hex is base 16, the usual way to write memory contents. The output shows the letters running straight past the 8 bytes of `buffer`.

:::check id=chk-which-watch
A variable's value keeps changing to nonsense while the program runs, and you do not know which line does it. Which GDB tool fits best?

- [x] A watchpoint on that variable
- [ ] A breakpoint at the start of `main`
- [ ] `backtrace` after the program ends

A watchpoint stops the program at the exact moment the value changes, whichever line caused it. A breakpoint needs you to know where to stop, and `backtrace` has nothing to show once the program has ended.
:::

## Finding leaks with Valgrind

A memory leak never crashes anything, so GDB has no moment to stop at. Valgrind runs your program and keeps a record of every block of heap memory, so at the end it can report what was never freed:

```c
1  #include <stdlib.h>
2
3  void leak_function(void) {
4      int *ptr = malloc(100 * sizeof(int));
5      ptr[0] = 1;
6  }
7
8  int main(void) {
9      leak_function();
10     return 0;
11 }
```

```text
$ gcc -g leak.c -o leak
$ valgrind --leak-check=full ./leak
==1234== 400 bytes in 1 blocks are definitely lost in loss record 1 of 1
==1234==    at 0x...: malloc (in ...)
==1234==    by 0x...: leak_function (leak.c:4)
==1234==    by 0x...: main (leak.c:9)
==1234==
==1234== LEAK SUMMARY:
==1234==    definitely lost: 400 bytes in 1 blocks
==1234== ERROR SUMMARY: 1 errors from 1 contexts
```

Read it from the top. 400 bytes are "definitely lost", which means nothing holds their address any more. The block was reserved at line 4 of `leak.c`, in `leak_function`, which `main` called on line 9. `1234` is just the ID number of the process.

Valgrind reports more than leaks:

- **Using memory after `free`, or past the end of a block.** It prints `Invalid read` or `Invalid write`, with the line.
- **Using values that were never set.** It prints a message such as `Conditional jump or move depends on uninitialised value(s)`. Add `--track-origins=yes` to see where that value came from.

A clean run ends with `ERROR SUMMARY: 0 errors`. Valgrind makes a program run much slower, so use it for testing and not for normal runs.

:::trap
Thinking a program is correct because it did not crash. Leaks and small overflows often cause no visible problem until much later. Run new code through Valgrind even when it looks fine.
:::

## GDB commands to keep nearby

| Command | Short form | What it does |
| --- | --- | --- |
| `run` | `r` | start the program |
| `break main`, `break 12` | `b` | pause at a function or line |
| `info breakpoints` | | list the breakpoints |
| `delete 1` | | remove breakpoint number 1 |
| `next` | `n` | run one line, and do not enter called functions |
| `step` | `s` | run one line, and go inside a called function |
| `continue` | `c` | run until the next stop |
| `finish` | | run until this function returns |
| `print x`, `print *p` | `p` | show a value |
| `display x` | | show a value again at every stop |
| `ptype x` | | show the type of a variable |
| `watch x` | | stop when `x` changes |
| `x/4xw p` | | show raw memory at an address |
| `backtrace` | `bt` | list the stack frames |
| `frame 1` | | move to frame number 1 to look at its variables |
| `info locals` | | show the local variables of this frame |
| `info args` | | show the parameters of this frame |
| `quit` | `q` | leave GDB |

## Practice

:::problem id=prac-pick-the-tool title="Pick the tool" source="ps2.pdf" kind=exercise solution_origin=derived
:::check id=prac-pick-the-tool-q1
GDB shows addresses but no line numbers for your code. You most likely forgot the compiler option {{=-g|-Wall|-o}}.

`-g` keeps line numbers and variable names in the program file. `-Wall` turns on warnings, and `-o` names the output file.
:::

:::check id=prac-pick-the-tool-q2
A long-running program slowly uses more and more memory, and it never crashes. The best first tool is {{=valgrind --leak-check=full|a breakpoint on main|backtrace}}.

Growing memory suggests a leak, and Valgrind reports which `malloc` was never freed. GDB has no crash to stop at.
:::

:::check id=prac-pick-the-tool-q3
You are stopped at a line that calls `compute()`, and you want to go inside that function. The command is {{=step|next|finish}}.

`next` runs the whole call as one line. `finish` runs until the current function returns.
:::
:::

:::problem id=prac-read-valgrind title="Reading a report" source="ps2.pdf" kind=exercise solution_origin=derived
Valgrind prints `800 bytes in 2 blocks are definitely lost`, followed by `by 0x...: load (data.c:12)`.

:::check id=prac-read-valgrind-q1
The memory that leaked was reserved {{=by code at line 12 of data.c, in load|by Valgrind itself|at line 800}}.

The report points to where the memory was reserved. The fix is usually somewhere else: wherever the block should have been freed.
:::

:::check id=prac-read-valgrind-q2
A program prints the right answer, and Valgrind reports `Invalid read of size 4`. The program {{=has a real bug, even though the answer looked right|is fine, because the answer is correct|has a bug in Valgrind}}.

It read 4 bytes it was not allowed to read. That is undefined behavior, even if the value it got happened to be right.
:::
:::

## Lecture 2 in one paragraph

A cast changes a value's type but never checks that it fits, so big numbers lose their left bits and bytes can change meaning. A pointer can point to another pointer, and `**` follows both arrows; that is how a function changes the caller's pointer. Adding to a pointer moves by whole elements, subtracting two pointers counts elements, and `sizeof` tells an array (its full size) apart from a pointer (8 bytes). A pointer that was never set, or is `NULL`, must not be followed. Functions have addresses too, so a function pointer lets you pass, store, and return functions. Each function call gets a frame on the stack, which disappears when the function returns. `malloc` reserves heap memory while the program runs, `calloc` does the same with zeros, `realloc` resizes it, and `free` returns it, exactly once, at the address `malloc` gave. The heap suits large arrays, arrays that must outlive a function, and arrays that change size; the stack is faster and frees itself. Structures can live in either place: use a dot on a structure and an arrow on a pointer, and order the members to reduce padding. When something goes wrong, GDB shows where and why a program crashed, and Valgrind finds leaks and bad memory use.
