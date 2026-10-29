---
title: "Lab: how big can a local array be?"
---

In the lesson "Stack or heap?" you read that the stack is small, usually about 8 MB, while the heap can use most of the computer's memory. So a huge local array crashes the program, and the same array from `malloc` works. In this lab you see it happen on your own computer. It needs a real machine, because the stack limit belongs to your operating system.

## What is in the folder

- `bigarray.c`: a program that adds up `N` numbers twice. `sum_on_stack` keeps them in a local array, on the stack. `sum_on_heap` should keep them in a heap block from `malloc`, but it is left for you: it has a `TODO` comment and returns 0 for now. Before it starts, the program prints your stack limit and the size of the array.
- `Makefile`: a small recipe file for `make`, a tool that runs the long `gcc` commands for you, as in the Lecture 1 lab.

## What to do in VS Code

1. Download the zip below and unzip it. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
2. Open a terminal inside VS Code: **Terminal → New Terminal**. You need `gcc` and `make`, installed as in the Lecture 1 lab (`xcode-select --install` on macOS, `sudo apt install build-essential` on Linux or WSL).
3. Type `make test` and press Enter. It runs the heap version on 1000 numbers. Right now it prints `heap:  WRONG`, because `sum_on_heap` returns 0, and then make prints a line like `make: *** [test] Error 1`. That is expected.
4. Open `bigarray.c` and write `sum_on_heap`, following its four `TODO` steps: `malloc` room for `n` `int`s (return -1 if you get `NULL`), fill element `i` with `i % 7`, add them all up, and `free` the block.
5. Run `make test` again until it prints `heap:  OK, sum = 2997`.
6. Type `make run`. It tries 10 million `int`s, about 40 MB: first on the heap, then as a local array on the stack.

## What you should see

On a typical machine with an 8 MB stack, the output looks like this:

```text
Stack limit: 8.0 MB
Array: 10000000 ints = 38.1 MB
heap:  OK, sum = 29999994
stack: the array is bigger than the stack limit, so expect a crash...
make: *** [run] Segmentation fault: 11
```

The program counts a megabyte as 1024 × 1024 bytes, the way the operating system counts the stack, so 40 000 000 bytes show as 38.1 MB. On Linux the last line says `Segmentation fault (core dumped)`. Either way, the heap version finished, and the stack version crashed: a **stack overflow**.

If your stack limit is bigger than 38.1 MB, the stack version will not crash at this size. Then type `make run N=50000000` to try 50 million `int`s (about 190 MB).

## What to write down

1. your stack limit, as the program prints it,
2. the size of the array that crashed on the stack but worked on the heap.

Then write **one sentence** that explains the difference, using the lesson's idea of where each array lives. For example, it could start: "The heap version worked because…"

**Going further (optional).** Find the largest `N` that still works on the stack. Try `make run N=...` with smaller values, halving the gap each time, until you are close. Compare `N × 4` bytes with your stack limit. It will be a little smaller than the limit, because the stack also holds the other functions' local variables.

You are done when `make test` prints `heap:  OK`, and you have the two numbers and your sentence.
