---
title: "Lab: how big can a local array be?"
---

In the lesson "Stack or heap?" you read that the stack is small, usually about 8 MB, while the heap can use most of the computer's memory. So a huge local array crashes the program, and the same array from `malloc` works. In this lab you see it happen on your own computer. It needs a real machine, because the stack limit belongs to your operating system.

## What is in the folder

This lab has two parts. Part 1 is the stack limit. Part 2 is a final exercise that uses everything from Lecture 2.

- `bigarray.c`: a program that adds up `N` numbers twice. `sum_on_stack` keeps them in a local array, on the stack. `sum_on_heap` should keep them in a heap block from `malloc`, but it is left for you: it returns 0 for now. Before it starts, the program prints your stack limit and the size of the array.
- `Makefile`: a small recipe file for `make`, a tool that runs the long `gcc` commands for you, as in the Lecture 1 lab.
- `final/` and `tests/`: the code for Part 2.

## Part 1: what to do in VS Code

1. Download the zip below and unzip it. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
2. Open a terminal inside VS Code: **Terminal → New Terminal**. You need `gcc` and `make`, installed as in the Lecture 1 lab (`xcode-select --install` on macOS, `sudo apt install build-essential` on Linux or WSL).
3. Type `make test` and press Enter. It runs the heap version on 1000 numbers. Right now it prints `heap:  WRONG`, because `sum_on_heap` returns 0, and then make prints a line like `make: *** [test] Error 1`. That is expected.
4. Open `bigarray.c` and write `sum_on_heap`. It does the same work as `sum_on_stack`, but in a block from `malloc`, and it gives the block back at the end. It returns -1 if `malloc` fails.
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

Part 1 is done when `make test` prints `heap:  OK`, and you have the two numbers and your sentence.

## Part 2: the final exercise, a growing list of words

Now you build one small program that uses every lesson of Lecture 2. It reads words, one on each line, until the input ends. You do not know how many words will come, so the list has to grow as it reads. At the end it prints how many words it read, and which of them are long:

```text
$ printf 'apple\nfig\nbanana\n' | ./words
Read 3 words
Long words: 2
apple
banana
```

(`printf '...' | ./words` feeds those lines to the program as if you had typed them. `\n` is a line break, and `|` connects the output of one command to the input of the next.)

The code is in the `final/` folder. The list is a heap array of pointers, and each pointer holds the address of a word in its own heap block. The functions are there with nothing inside them. This is what each one must do:

- `copy_word(word)` returns a new heap block holding a copy of `word`, exactly `strlen(word) + 1` bytes, or `NULL` if there is no memory.
- `add_word(list, n, word)` adds a copy of `word` to the end of the caller's list, and adds 1 to `*n`. `*list` is `NULL` when `*n` is 0. It returns 0 if it worked, or -1 if there is no memory, and then the list stays as it was.
- `is_long(word)` returns 1 if the word has 5 letters or more, otherwise 0.
- `count_matching(list, n, keep)` returns how many of the `n` words make `keep(word)` return non-zero.
- `print_matching(list, n, keep)` prints each word that `keep` accepts, on its own line, in order. It walks through the list with a pointer, a `char **`.
- `free_words(list, n)` frees every word and then the list itself.
- `main` reads each line with `fgets` until the input ends, removes the newline, and adds the line to the list. If `add_word` fails, it frees the list and returns 1. Otherwise it prints the output shown earlier, and frees everything.

| You write | What it practices | Lesson |
| --- | --- | --- |
| `add_word`, which changes the caller's list through a `char ***` | Changing the caller's pointer | Pointers to pointers |
| `print_matching`, which walks through the list with a pointer | Moving a pointer through an array | Pointer arithmetic and pointer mistakes |
| `count_matching` and `print_matching`, which receive the rule `is_long` as a function | Passing a function to a function | Pointers to functions |
| `copy_word`, using exactly the bytes it needs | `malloc` and `strlen` + 1 | Memory on request: malloc and free |
| The growing list, the lines from `fgets`, and `free_words` | `realloc`, arrays of strings, and freeing in the right order | Resizing memory and arrays of strings |
| One sentence, in the list below | Choosing where memory lives | Stack or heap? |

A `char ***` looks scary, but you have seen each piece. The list is a `char **`, because it points to the first of many `char *` words. To change the caller's list, `add_word` needs the address of that list, and that adds one more star. So `*list` *is* the caller's list.

### What to do

1. Type `make final`. It builds your code and prints one line for each check: `OK` or `WRONG`, and the reason. Most say `WRONG` for now, and make ends with an error line. That is expected.
2. Open `final/wordlist.c` and write each function, one at a time, in order. `add_word` uses `copy_word`, so start at the top. Run `make final` after each function, and watch the `WRONG` lines disappear.
3. Open `final/main.c` and write `main`.
4. Try it yourself. Type `make words`, and then `./words`. Type a few words, pressing Enter after each one. To say the input has ended, press **Ctrl+D** on a new line.

`make final` also counts your memory. It builds your code with a small counter in the middle of every `malloc`, `realloc`, and `free`, and fails if any block is left unfreed when the program ends. So a memory leak, which is normally silent, shows up here as `WRONG`.

### What to write down

Write **one sentence** that explains why this list has to live on the heap, not in a local array. It could start: "A local array would not work here because…" The lesson gives you two reasons that fit.

You are done with the whole lab when `make final` prints `OK: every final check passes.`, and you have your sentence.
