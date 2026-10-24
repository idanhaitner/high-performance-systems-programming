# Practice: write C yourself

The lessons teach one idea at a time. This folder is where you practice writing C, from printing your name to exam-style questions. Each level is harder than the one before it, and each one uses only what the earlier levels used.

## How to practice one level

Open a terminal in the `c` folder. Then:

1. Open `practice/01-printing/exercise.c`. Every function has a comment that says exactly what it must do, often with an example.
2. Write the body of each function. Delete the `not_implemented(...)` line, or the `// Write your code here.` line, and put your code in its place.
3. Run the checker:

   ```bash
   make practice LEVEL=01-printing
   ```

4. Fix every `[fail]` line, fill in every `[todo]` line, and run again.
5. Stuck after a real attempt? Open `solution.c` in the same folder. Every answer has comments that explain the steps. You can run it with `make practice-solution LEVEL=01-printing`.

The checker prints the same three tags as the lessons: `[pass]`, `[fail]` with what was expected, and `[todo]` for a function you have not written yet. For printing exercises, a `[fail]` shows the first line that differs, so a missing space or a missing `\n` is easy to spot.

You can also write your own `main` in a new file and run it with the compiler directly, to try things out:

```bash
cc -std=c11 -Wall -Wextra -o scratch scratch.c && ./scratch
```

## The levels

| Level | You practice | Examples |
| --- | --- | --- |
| `01-printing` | `printf`, `%s`, `%d`, `%.2f`, and printing in loops | greet a name, a row of numbers, a triangle of stars, a times table, FizzBuzz |
| `02-arithmetic` | Calculating with `int` and `double`, `/` and `%` | Celsius to Fahrenheit, an average that keeps its fraction, seconds to hours and minutes, the fewest coins |
| `03-conditions` | `if`, `else if`, `switch`, and `bool` | leap year, letter grade, days in a month, kind of triangle, a small calculator |
| `04-loops` | `for`, `while`, and working with digits | factorial, power, sum of digits, reverse a number, prime test, gcd, Fibonacci, binary to decimal |
| `05-arrays` | Arrays and their length | sum, average, position of the max, reverse, is it sorted, second largest, merge two sorted arrays |
| `06-strings` | Strings that end in `'\0'` | your own `strlen`, `strcpy`, `strcmp`, `atoi`, palindrome, count words, Caesar cipher |
| `07-pointers` | Passing addresses, and returning more than one answer | swap, quotient and remainder, min and max, walk an array with a pointer, split a full name |
| `08-memory` | `malloc`, `realloc`, and `free` | copy an array, copy a string, join two strings, grow an array, a 2D grid |
| `09-structs` | `struct`, `.` and `->` | distance between points, a rectangle, adding fractions, adding minutes to a time, the best student |
| `10-exam` | Exam-style questions that mix everything | count bits, binary search, bubble sort, transpose a grid, compress a string, anagrams, a linked list |

## Tips

- Read the whole comment before you write any code. The examples in it are the tests.
- Write a little, run, and repeat. Do not write ten functions and then run for the first time.
- From level 08 on, also check for memory you forgot to free:

  ```bash
  make practice-leaks LEVEL=08-memory
  ```

- `make test-practice` runs every finished solution. Use it to check that the practice set itself works.
