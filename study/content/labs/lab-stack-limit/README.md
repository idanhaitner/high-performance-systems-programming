---
title: "Lab: how big can a local array be?"
---

Local variables live on the **stack**, a small area of memory, usually about 8 MB. Memory from `malloc` comes from the **heap**, which can use most of the computer's memory.

So a huge local array crashes the program, and the same array from `malloc` works. In this lab you see it happen on your own computer. It needs a real machine, because your operating system sets the stack limit.

## Get ready

1. Download the lab files with the button on this page, and unzip them.
2. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal**.
4. Check that you have `gcc`, the compiler, and `make`, a tool that runs the long `gcc` commands for you. To install them, type `xcode-select --install` on macOS, or `sudo apt install build-essential` on Linux or WSL (the Linux system built into Windows).

The folder holds:

- `bigarray.c`: the program for Part 1.
- `Makefile`: the recipe file that `make` reads.
- `final/` and `tests/`: the code for Part 2, a final exercise that uses everything from Lecture 2.

## Part 1: write the heap version

`bigarray.c` adds up `N` numbers twice. `sum_on_stack` keeps them in a local array, on the stack. `sum_on_heap` should keep them in a block from `malloc`, but it is left for you. It returns 0 for now.

1. Type `make test` and press Enter. It runs the heap version on 1000 numbers. It prints `heap:  WRONG`, and then make prints a line like `make: *** [test] Error 1`. That is expected, because `sum_on_heap` returns 0.
2. Open `bigarray.c` and write `sum_on_heap`. It does the same work as `sum_on_stack`, but in a block from `malloc`. It gives the block back at the end, and returns -1 if `malloc` fails.
3. Run `make test` again until it prints `heap:  OK, sum = 2997`.

## Part 1: watch the stack crash

Type `make run`. It tries 10 million `int`s, about 40 MB: first on the heap, then as a local array on the stack.

On a typical machine with an 8 MB stack, you see this:

```text
Stack limit: 8.0 MB
Array: 10000000 ints = 38.1 MB
heap:  OK, sum = 29999994
stack: the array is bigger than the stack limit, so expect a crash...
make: *** [run] Segmentation fault: 11
```

The heap version finished, and the stack version crashed. This crash is a **stack overflow**: the array did not fit on the stack. On Linux, the last line says `Segmentation fault (core dumped)`.

### Why 38.1 MB and not 40?

The program counts a megabyte as 1024 × 1024 bytes, the way the operating system counts the stack. So 40 000 000 bytes show as 38.1 MB.

### If nothing crashed

Your stack limit is bigger than 38.1 MB. Type `make run N=50000000` to try 50 million `int`s, about 190 MB.

## Part 1: write down what you found

Write down:

1. your stack limit, as the program prints it,
2. the size of the array that crashed on the stack but worked on the heap.

Then write **one sentence** that explains the difference, using where each array lives. It could start: "The heap version worked because…"

Part 1 is done when `make test` prints `heap:  OK`, and you have the two numbers and your sentence.

### Going further (optional)

Find the largest `N` that still works on the stack. Try `make run N=...` with smaller values, halving the gap each time, until you are close.

Then compare `N × 4` bytes with your stack limit. It will be a little smaller than the limit, because the stack also holds the other functions' local variables.

## Part 2: what you will build

You build one small program that reads words, one on each line, until the input ends. You do not know how many words will come, so the list has to grow as it reads. At the end it prints how many words it read, and which of them are long:

```text
$ printf 'apple\nfig\nbanana\n' | ./words
Read 3 words
Long words: 2
apple
banana
```

The first line feeds three lines to the program, as if you had typed them. In it, `\n` is a line break, and `|` connects the output of one command to the input of the next.

The list is a heap array of pointers. Each pointer holds the address of one word, and each word has its own heap block.

## Part 2: the functions to write

The code is in the `final/` folder. The functions are there with nothing inside them.

In `final/wordlist.c`:

- `copy_word(word)` returns a new heap block holding a copy of `word`, exactly `strlen(word) + 1` bytes, or `NULL` if there is no memory.
- `add_word(list, n, word)` adds a copy of `word` to the end of the caller's list, and adds 1 to `*n`. `*list` is `NULL` when `*n` is 0. It returns 0 if it worked, or -1 if there is no memory, and then the list stays as it was.
- `is_long(word)` returns 1 if the word has 5 letters or more, otherwise 0.
- `count_matching(list, n, keep)` returns how many of the `n` words make `keep(word)` return non-zero.
- `print_matching(list, n, keep)` prints each word that `keep` accepts, on its own line, in order. It walks through the list with a pointer, a `char **`.
- `free_words(list, n)` frees every word and then the list itself.

In `final/main.c`:

- `main` reads each line with `fgets` until the input ends, removes the newline, and adds the line to the list. If `add_word` fails, it frees the list and returns 1. Otherwise it prints the output from the example, and frees everything.

### Why `add_word` takes a `char ***`

It looks scary, but you have seen each piece. The list is a `char **`, because it points to the first of many `char *` words. To change the caller's list, `add_word` needs the address of that list, and that adds one more star. So `*list` *is* the caller's list.

## Part 2: build and test it

1. Type `make final`. It builds your code and prints one line for each check: `OK` or `WRONG`, and the reason. Most say `WRONG` for now, and make ends with an error line. That is expected.
2. Write each function in `final/wordlist.c`, in order. `add_word` uses `copy_word`, so start at the top. Run `make final` after each function, and watch the `WRONG` lines disappear.
3. Write `main` in `final/main.c`.
4. Try it yourself. Type `make words`, and then `./words`. Type a few words, pressing Enter after each one. To end the input, press **Ctrl+D** on a new line.

`make final` also counts your memory, and fails if any block is left unfreed when the program ends. So a memory leak, which is normally silent, shows up here as `WRONG`.

## Part 2: finish the lab

Write **one sentence** that explains why this list has to live on the heap, not in a local array. It could start: "A local array would not work here because…" Two different reasons fit.

You are done with the whole lab when `make final` prints `OK: every final check passes.`, and you have your sentence.

### What you practiced

| You wrote | What it practices |
| --- | --- |
| `add_word`, which changes the caller's list through a `char ***` | Changing the caller's pointer |
| `print_matching`, which walks through the list with a pointer | Moving a pointer through an array |
| `count_matching` and `print_matching`, which receive the rule `is_long` as a function | Passing a function to a function |
| `copy_word`, using exactly the bytes it needs | `malloc` and `strlen` + 1 |
| The growing list, the lines from `fgets`, and `free_words` | `realloc`, arrays of strings, and freeing in the right order |
| Your sentence about the heap | Choosing where memory lives |
