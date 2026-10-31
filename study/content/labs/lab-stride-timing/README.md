---
title: "Lab: time two ways to read a grid"
---

The order you visit memory can change the speed, even when the work is the same. In this lab you measure it yourself, on your own computer.

## The idea

A **grid** (a 2D array) is a table of numbers. A **row** is one horizontal line of the table: `grid[0][0]`, `grid[0][1]`, `grid[0][2]`, and so on. A **column** is one vertical line: `grid[0][0]`, `grid[1][0]`, `grid[2][0]`, and so on. In `grid[i][j]`, `i` is the row number and `j` is the column number.

Memory is one long line of bytes, so C stores the grid row by row: all of row 0, then all of row 1. That means:

- Moving along a row (`j` grows by 1) goes to the **neighbor** in memory, 4 bytes away.
- Moving down a column (`i` grows by 1) jumps over a **whole row**. Here a row has 4096 `int`s, so that is 4096 × 4 = 16 384 bytes away.

The processor never fetches just one number. It fetches a 64-byte block, a **cache line**, into a small fast memory called the **cache**. That is 16 `int`s at once.

Reading row by row uses all 16 before fetching the next block. Reading column by column uses one and then jumps far away, so it keeps going back to slow memory.

## Get ready

1. Download the lab files with the button on this page, and unzip them.
2. In VS Code, choose **File → Open Folder…** and open the unzipped folder.
3. Open a terminal inside VS Code: **Terminal → New Terminal**.
4. Check that you have `gcc`, the compiler, and `make`, a tool that reads a recipe file and runs the long `gcc` commands for you.

To install them:

- On macOS, type `xcode-select --install`. There, `gcc` is really Apple's compiler `clang` under another name, which is fine for this lab.
- On Linux, type `sudo apt install build-essential`.
- On Windows, use WSL (the Linux system built into Windows) and the same Linux command.

The folder holds:

- `stride.c`: the program for Part 1.
- `Makefile`: the recipe file that `make` reads.
- `final/` and `tests/`: the code for Part 2, a final exercise that uses everything from Lecture 1.

## Part 1: write the two sums

`stride.c` fills a 4096 × 4096 grid of `int`s (64 MB), adds up every number twice, times both, and prints the results. The two adding functions, `sum_rows` and `sum_cols`, are left for you. Each returns 0 for now.

1. Type `make test` and press Enter. It builds a small 1024 × 1024 grid and checks both sums. It prints `WRONG`, because both functions return 0. Then make prints a line like `make: *** [test] Error 1`. This is expected: it just means the test failed.
2. Open `stride.c` and write both functions. `sum_rows` adds up every number in `grid` row by row, so its inner loop moves along one row. `sum_cols` adds them up column by column, so its inner loop moves down one column.
3. Run `make test` again until it prints `OK: both sums are 1072693248.`

## Part 1: time them

Type `make run`. This builds the full 4096 × 4096 grid with `-O2`, the option that asks the compiler to make the code fast, the way real programs are built. Then it runs the timing.

The two functions do exactly the same additions on exactly the same numbers. Only the order of the reads differs.

You see something like this, with different numbers:

```text
Grid: 4096 x 4096 ints (64 MB)
row by row:       sum = 68702699520, time = 0.0066 s
column by column: sum = 68702699520, time = 0.0687 s
OK: both sums are 68702699520.
Column by column took 10.3 times as long as row by row.
```

## Part 1: write down what you found

Run `make run` three times, because times jump around a little. Write down:

1. the time for row by row,
2. the time for column by column,
3. how many times slower column by column was.

Then write **one sentence** that explains the difference, using the idea of reading memory in order. It could start: "Row by row is faster because each read is the neighbor of the previous one, so…"

Part 1 is done when `make test` prints `OK`, and you have the three numbers and your sentence.

## Part 2: what you will build

You build one small program that uses every lesson of Lecture 1. You give it players and their points on the command line:

```text
./report Dana 90 Noam 75 Lior 82
```

And it prints this report:

```text
Dana 90
Noam 75
Lior 82
Total: 247
Average: 82.33
Best: Dana (90)
```

The code is split into three files in the `final/` folder: `players.h`, `players.c`, and `main.c`.

## Part 2: the functions to write

The functions are there with nothing inside them.

In `final/players.c`:

- `read_players(argc, argv, list)` reads pairs of words, a name and then its points, from `argv[1]` onward, into `list`. It returns how many players it read, or -1 if there are no words, an odd number of words, or more than `MAX_PLAYERS` players. A name too long for its array is cut short, and it still ends with `'\0'`.
- `total_points(list, n)` returns the sum of all the points. It must work for scores so big that their total does not fit in an `int`.
- `average_points(list, n)` returns the average, with its fraction, so 7 points for 2 players is 3.5. `n` is at least 1.
- `best_player(list, n)` returns a pointer to the player with the most points, and the first of them if players tie. It walks through the array with a pointer. `n` is at least 1.
- `print_report(list, n)` prints the report in exactly the shape shown in the example, with 2 digits after the point in the average.

In `final/main.c`:

- `main` calls `read_players`. If that returns -1, it prints a short message that shows how to use the program, and returns 1. Otherwise it calls `print_report` and returns 0.

### A type for big totals

A `long long` is a whole number type of 8 bytes on typical machines, big enough for these totals. `printf` shows it with `%lld`.

## Part 2: build and test it

1. Type `make final`. It stops with an error like ``call to undeclared function 'best_player'`` (the exact words depend on your compiler). The compiler is reading another file that calls `best_player`, but `players.h` never told it about that function. This error is expected, and fixing it is your first task.
2. Open `final/players.h` and add the declaration of `best_player`: copy its first line from `players.c`, and end it with a semicolon. Type `make final` again. Now it builds, and it prints one line for each check: `OK` or `WRONG`, and the reason. Most say `WRONG` for now.
3. Open `final/players.c` and `final/main.c`, and write each function, one at a time. Run `make final` after each function, and watch the `WRONG` lines disappear.
4. Try your own players: `./report Ana 10 Ben 20`. Also try a mistake, `./report Ana`, and it should print how to use the program.

## Part 2: build it by hand

Build the program by hand, one step at a time, to see what `make` does for you. First type `cd final`, and then type these:

```text
gcc -c players.c
gcc -c main.c
gcc main.o players.o -o report
```

The first two lines each make an object file, and the third links them.

Now leave a file out, with `gcc main.o -o report`, and read the "undefined" error: the linker could not find the code of the functions in `players.c`.

Then go back with `cd ..`, and remove the extra files with `rm final/*.o final/report`.

## Part 2: finish the lab

You are done with the whole lab when `make final` prints `OK: every final check passes.`

### What you practiced

| You wrote | What it practices |
| --- | --- |
| `total_points`, for totals too big for an `int` | Numbers have a limited size |
| `average_points`, which keeps the fraction | Dividing whole numbers |
| `best_player`, which walks through the array with a pointer and returns a pointer | Pointers and arrays |
| `print_report`, in an exact format | `printf` placeholders |
| Copying the name in `read_players`, even when it is too long to fit | `strncpy` and `'\0'` |
| Filling an array of `struct player` | Structures and `->` |
| The missing declaration in `players.h` | Headers and several `.c` files |
| Reading the pairs of words in `main` and `read_players` | `argc`, `argv`, and `atoi` |
