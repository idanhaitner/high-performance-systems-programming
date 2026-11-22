---
id: threads-and-processes
title: "Threads: several workers inside one program"
sources:
  - "Lecture 5 - Pthreads in C.pdf"
---

Lecture 4 made one processor core do more work in each tick of its clock. But a modern processor chip has several **cores**: separate units that can each run instructions at the same time. A program like the ones you have written so far uses only one of them. This lesson explains how a program can use several cores at once, with **threads**, and what changes when it does.

## One cook or four cooks

Picture a kitchen with one cook who must chop a hundred onions. The cook works through them one by one. Now put four cooks in the same kitchen, each with a pile of 25 onions. They share the same room, the same fridge, and the same table, and the job takes about a quarter of the time.

A **thread** is one of those cooks. It is one path of instructions that runs through your program. Every program you have written so far has had exactly one thread: it starts at `main` and goes step by step. A program can ask for more threads, and each one runs its own function at the same time as the others.

:::definition id=def-thread title="Thread" source="Lecture 5 - Pthreads in C.pdf"
A **thread** is one independent path of execution inside a running program. A program starts with one thread, which runs `main`, and can start more. All the threads of a program share its memory.
:::

## Why use threads?

There are three common reasons.

1. **Finish sooner.** If a job splits into parts that do not depend on each other, several cores can each do a part at the same time. Adding up a huge array is a good example: four threads can each add up one quarter.
2. **Stay responsive.** One thread can wait for something slow, such as a file or the network, while another keeps answering the user.
3. **Share data cheaply.** Threads of one program see the same memory, so they can work on the same array without copying it.

A thread gives the operating system the **chance** to run work in parallel. It does not promise it. The operating system decides which thread runs on which core, and when. If there are more threads than cores, some of them take turns.

## A process and its threads

In Lecture 1 you met the **process**: a program that is running, with its own memory. The operating system keeps processes apart, so one program cannot read another program's memory by mistake.

A thread lives **inside** a process. A process holds the memory and the open files, and one or more threads run inside it. When a process starts, it has one thread. The rest of this lecture uses a library called **Pthreads** (short for POSIX threads) to create more. POSIX is a standard that Linux and macOS follow, so Pthreads code works on both.

| | Process | Thread |
| --- | --- | --- |
| What it is | A running program | One path of execution inside a process |
| Memory | Its own, kept apart from other processes | Shares the memory of its process |
| Holds | Memory, open files, and one or more threads | Its own stack, registers, and place in the code |

## What threads share, and what each one keeps

Every thread needs a few things of its own, because it runs its own sequence of function calls:

- its own **stack**, the memory area that holds the local variables of the functions it is running,
- its own **registers**, the few tiny storage slots inside the core that hold the values it is working on right now,
- its own **program counter**, the address of the next instruction it will run.

Everything else belongs to the process, so every thread sees it:

- the **code** of the program,
- the **global variables**, declared outside any function,
- the **heap**, the memory you get from `malloc`,
- the **open files**.

![The process box holds a shared row: code, global variables, the heap, and open files, used by every thread. Below it are three thread boxes, each with its own stack, registers, and program counter.](../assets/figures/thread-memory.svg)

This split explains most of the lecture. A local variable inside a thread's function lives on that thread's stack, so no other thread uses it by accident. A global variable or a `malloc` block is one single object that all threads can reach.

Sharing makes it cheap for threads to work together. It also creates the main danger of this lecture: two threads changing the same value at the same time. A later lesson shows exactly how that goes wrong.

:::check id=chk-thread-shares
A program has a global variable `int total` and a function with a local variable `int i`. Two threads run that function at the same time. Which statement is true?

- [ ] Each thread has its own `total` and its own `i`
- [x] Both threads use the same `total`, and each thread has its own `i`
- [ ] Both threads use the same `total` and the same `i`

Global variables belong to the process, so there is one `total` for all threads. A local variable lives on the stack, and each thread has its own stack, so each thread has its own `i`.
:::

:::check id=chk-thread-heap
One thread calls `malloc` and stores the address it gets back in a global pointer. Can a second thread of the same program read that memory through the pointer?

- [x] Yes, the heap belongs to the whole process, so every thread can reach it
- [ ] No, each thread has its own heap
- [ ] Only if the second thread calls `malloc` too

Each thread has its own stack, but the heap is shared by the whole process. Any thread that has the address can use the memory.
:::

## More threads does not always mean faster

Four cooks are only faster if there are four parts of the job to hand out, and if they do not keep waiting for each other at the fridge. Threads are the same. Starting a thread costs time, and threads that keep waiting for each other can be slower than one thread alone. The last lesson of this lecture shows how to measure what you gained.

:::problem id=prac-what-is-shared title="Shared or private?" source="Lecture 5 - Pthreads in C.pdf" kind=exercise solution_origin=derived
A program declares `int counter = 0;` outside any function. Each thread runs `void *work(void *arg)`, which declares `int steps = 0;` and calls `malloc` for a buffer whose address it keeps in a local pointer `buf`.

:::check id=prac-what-is-shared-q1
`counter` is {{=one variable that every thread shares|a separate copy for each thread|only visible to the main thread}}.

It is a global variable, and global variables belong to the process.
:::

:::check id=prac-what-is-shared-q2
`steps` is {{=a separate copy for each thread|one variable that every thread shares|stored on the heap}}.

It is a local variable, so it lives on the stack of the thread that runs the function.
:::

:::check id=prac-what-is-shared-q3
The block that `buf` points to lives {{=on the heap, which other threads could reach if they had the address|on the thread's stack|in a memory area no other thread can ever reach}}.

`malloc` memory is on the shared heap. Only `buf` itself, the local pointer, is private, so other threads do not know the address unless the thread hands it to them.
:::
:::

**Next:** how to start a thread in C, and how to wait until it has finished.
