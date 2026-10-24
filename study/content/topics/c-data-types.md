---
id: c-data-types
title: Values and types
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/02-types/lesson.md
  - c/03-expressions/lesson.md
---

In the last lesson we saw that numbers live in boxes of a fixed size. This lesson shows how C lets you choose those boxes. You will learn the basic kinds of values in C, how many bytes each takes, how to print and read them, and two places where C behaves differently from a calculator: dividing whole numbers, and storing decimals.

## Variables and types

A **variable** is a named box in memory that holds a value. In C, every variable has a **type**, and you must say the type when you create the variable:

```c
int age = 21;        /* a whole number */
double price = 9.99; /* a number with a decimal point */
char letter = 'a';   /* a single character */
```

Read the first line as: "make a box called `age`, of type `int`, and put 21 in it." Each line ends with a semicolon. Text between `/*` and `*/` is a **comment**: a note for humans that the computer ignores.

The type tells the computer three things:

1. **How big the box is** (how many bytes).
2. **What the bits mean** (a whole number? a decimal? a letter?).
3. **Which machine instructions to use** (adding two whole numbers is a different instruction from adding two decimals).

## Whole numbers: char, short, int, long

C has several whole-number types. They differ only in size. On the machines this course uses (64-bit Linux):

| Type | Size | Roughly holds |
| --- | --- | --- |
| `char` | 1 byte (8 bits) | $-128$ to $127$ |
| `short` | 2 bytes (16 bits) | about $\pm 32$ thousand |
| `int` | 4 bytes (32 bits) | about $\pm 2.1$ billion |
| `long` | 8 bytes (64 bits) | about $\pm 9.2 \times 10^{18}$ |

Each also has an `unsigned` version, the same size but holding only zero and positive numbers. For example, `unsigned int` is also 4 bytes.

:::definition id=def-int-widths title="Integer sizes on this course's machines" source="Lecture 1 - Introduction.pdf"
`char` is always 1 byte, everywhere. On this course's machines (64-bit Linux), `short` is 2 bytes, `int` is 4, and `long` is 8. `unsigned int` is the same size as `int`.
:::

Only the size of `char` is the same on every computer. The others can change: on 64-bit Windows, for example, `long` is 4 bytes, not 8. So never assume a size. Ask the computer with `sizeof` (below), or use a type whose size is in its name, such as `int32_t` (always 32 bits).

### What 42 looks like in each size

The number 42 is `101010` in binary. A bigger box just has more zeros on the left:

```c
char a = 42;   /* 00101010 */
short b = 42;  /* 00000000 00101010 */
int c = 42;    /* four bytes, ending in 00101010 */
long d = 42;   /* eight bytes, ending in 00101010 */
```

![The value 42 stored in a char, a short, an int, and a long.](../assets/figures/integer-widths.svg)

(This "fill with zeros" rule is for zero and positive numbers. A negative number is filled with ones instead, because of how two's complement works. The addresses in the picture are just examples.)

## Dividing whole numbers

When you divide two whole numbers in C, the answer is a whole number too. The part after the decimal point is simply **thrown away**.

```c
int x = 5;
int y = 2;
x = x / y;   /* x is now 2, not 2.5 */
```

$5 \div 2 = 2.5$, and C throws away the $.5$, giving 2. This is called **truncation toward zero**: you always chop toward 0, so `-5 / 2` is `-2` (not $-3$).

:::definition id=def-integer-division title="Integer division" source="c/03-expressions/lesson.md"
When both sides of `/` are whole-number types, C computes the true quotient and throws away the fractional part. The result always moves toward zero.
:::

The `%` operator gives the **remainder**: `7 % 3` is 1, because $7 = 2 \times 3 + 1$. With a negative number on the left, the remainder is negative too: `-5 % 2` is `-1`.

Dividing by zero, with `/` or `%`, is **undefined behavior**: the program may crash or produce garbage. Always check that the divisor is not zero.

:::problem id=worked-integer-division title="5 divided by 2 in int" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
What is `x` after `int x = 5; int y = 2; x = x / y;`? What would `-5 / 2` be?

:::solution
`x` is 2. Both numbers are `int`, so C throws away the fractional part of $2.5$. For `-5 / 2`, the true answer is $-2.5$, and throwing away the fraction (moving toward zero) gives `-2`.
:::
:::

:::trap
Assuming every computer uses the sizes in the table. Only `char` is guaranteed to be 1 byte. Use `sizeof` or a fixed-size type such as `int32_t` when the size matters.
:::

## Characters are small numbers

To a computer, a letter is just a number. A table called **ASCII** gives each character a code: `'a'` is 97, `'b'` is 98, `'A'` is 65, `'0'` is 48, and so on. Single quotes, like `'a'`, mean "the code of this character".

:::definition id=def-char-code title="Character constant" source="Lecture 1 - Introduction.pdf"
A character in single quotes, such as `'a'`, is a number: the character's code. On normal (ASCII) machines, `'a'` is 97 and `'b'` is 98.
:::

So these two lines store the same thing:

```c
char c1 = 'b';
char c2 = 98;   /* also 'b', because 'b' has code 98 */
```

Whether you see a letter or a number depends on how you print it. `printf` is the C function for printing. Its first argument is a text with placeholders, and each placeholder says how to show one value: `%c` shows it as a character, `%d` as a decimal number. `\n` means "new line".

```c
char c1 = 'a';
printf("%c\n", c1);    /* prints: a  */
printf("%d\n", c1);    /* prints: 97 */
```

A few extra facts, for later: C only promises that the digits `'0'` to `'9'` have codes in a row; the code 97 for `'a'` comes from ASCII. And whether a plain `char` can be negative depends on the machine.

:::check id=chk-char-code
On a normal ASCII machine, what does `printf("%d\n", c1)` print when `c1` holds `'a'`?

- [ ] a
- [x] 97
- [ ] 98

`%d` prints the number. The code of `'a'` is 97. `%c` would print the letter `a`.
:::

## Numbers with a decimal point: float and double

For numbers like $3.61$ or $42.8$, C has two types:

- `float`: 4 bytes, about 7 correct digits.
- `double`: 8 bytes, about 16 correct digits. This is the one you normally use.

:::definition id=def-float-widths title="float and double" source="Lecture 1 - Introduction.pdf"
On this course's machines, `float` is 4 bytes and `double` is 8. Both use the IEEE-754 standard: the bits are split into a sign, an exponent, and a fraction.
:::

### How the bits are used

These types work like scientific notation, but in base 2. Think of writing $42.8$ as $1.3375 \times 2^{5}$. The computer stores three pieces:

1. **Sign** (1 bit): 0 for positive, 1 for negative.
2. **Exponent**: the power of 2 (here, 5).
3. **Fraction**: the digits after the "1." (here, the binary digits of $.3375$).

A `float` uses 1 + 8 + 23 bits. A `double` uses 1 + 11 + 52 bits.

```text
float x = 3.61f;
/* 0 10000000 11001110000101000111101 */
/* sign | exponent (8 bits) | fraction (23 bits) */
```

```text
double y = 42.8;
/* 0 10000000100 0101011001100110011001100110011001100110011001100110 */
/* sign | exponent (11 bits) | fraction (52 bits) */
```

Two small tricks make the stored bits look odd at first:

- **The exponent is stored with an offset** (called a *bias*) so that it never needs its own sign. For `float` you subtract 127: the stored `10000000` is 128, and $128 - 127 = 1$, so $3.61 = 1.805 \times 2^{1}$. For `double` you subtract 1023: `10000000100` is 1028, and $1028 - 1023 = 5$, so $42.8 = 1.3375 \times 2^{5}$.
- **The leading "1." is not stored**, since it is always there. Only the fraction after it is stored.

Just like $1/3 = 0.333\ldots$ never ends in decimal, numbers like $3.61$ and $42.8$ never end in binary. So the computer stores the **closest** number it can, not the exact one. That tiny rounding is what lost the $3.14$ in the previous lesson.

### Decimal division

With `double`, division keeps the fraction:

```c
double x = 5.0;
double y = 2.0;
x = x / y;   /* x is now 2.5 */
```

So `5 / 2` (two `int`s) is `2`, but `5.0 / 2.0` (two `double`s) is `2.5`. Same symbol, two different operations, chosen by the types. Here 2.5 happens to be stored exactly; for something like `1.0 / 3.0`, the result is the closest `double` to $0.333\ldots$.

:::trap
Thinking the bits of `3.61f` store the digits 3, 6, and 1. They store a sign, a power of 2, and a binary fraction.
:::

## sizeof: asking how big something is

`sizeof` tells you how many bytes a type or a variable takes.

:::definition id=def-sizeof title="sizeof" source="Lecture 1 - Introduction.pdf"
`sizeof` gives the number of bytes in a type or a variable. Write `sizeof(int)` for a type (parentheses required) or `sizeof x` for a variable. The answer has type `size_t`, an unsigned whole-number type made for sizes.
:::

Here is a complete program. Every C program starts running in the function called `main`. The `#include <stdio.h>` line lets us use `printf`. `return 0;` at the end means "finished successfully".

```c
#include <stdio.h>

int main(void) {
    short x;
    int y;
    long z;
    printf("%zu, %zu, %zu\n", sizeof x, sizeof y, sizeof z);
    printf("%zu\n", sizeof(int));
    return 0;
}
```

On this course's machines it prints:

```text
2, 4, 8
4
```

To print a `sizeof` answer, use the placeholder `%zu` (the placeholder for `size_t`). Using `%d` here is a mistake, because `%d` expects an `int`.

:::problem id=worked-sizeof-sample title="sizeof of short, int, and long" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
What does the program above print on this course's machines, and which placeholder should print a `sizeof` result?

:::solution
The first line is `2, 4, 8`: the sizes of `short`, `int`, and `long`. The second line is `4`, the size of `int`. Use `%zu`, because `sizeof` gives a `size_t`. (Only the size of `char` is the same on every machine.)
:::
:::

## Reading input with scanf

`printf` prints. Its partner `scanf` reads what the user types. Here is a program that asks for three values:

```c
#include <stdio.h>

int main(void) {
    int x;
    float y;
    char z;

    printf("Enter an integer: ");
    if (scanf("%d", &x) != 1) {
        return 1;
    }
    printf("Enter a float: ");
    if (scanf("%f", &y) != 1) {
        return 1;
    }
    printf("Enter a character: ");
    if (scanf(" %c", &z) != 1) {
        return 1;
    }
    printf("x=%d, y=%f, z=%c\n", x, y, z);
    return 0;
}
```

Three things to notice:

1. **The `&` before each variable.** `printf` only needs to *read* a value, so you give it the value. `scanf` must *write into* your variable, so you give it the variable's location in memory, its **address**. `&x` means "the address of `x`". (The next lesson is all about addresses.)
2. **The `if (... != 1)` checks.** `scanf` returns how many values it managed to read. If the user typed `hello` where a number was expected, it returns 0, and our program stops with `return 1;` (a non-zero return means "something went wrong").
3. **The space in `" %c"`.** When you type `3.5` and press Enter, the Enter key is also a character (a newline). `%f` reads `3.5` but leaves the newline waiting. `%c` reads *any* character, so without the space it would read that leftover newline. The space tells `scanf` "skip spaces and newlines first". (`%d` and `%f` skip them automatically.)

If the user types `5`, `3.5`, and `b`, the program prints `x=5, y=3.500000, z=b`. `%f` shows six digits after the point by default.

### Making decisions and repeating

C has the usual building blocks for controlling what runs:

- `if` / `else` and `switch` to **choose** what to do.
- `for`, `while`, and `do` / `while` to **repeat**.
- `break` (leave a loop), `continue` (skip to the next round), and `return` (leave a function).

One classic mistake: to compare, write `==`. A single `=` means "store". So `if (x = 0)` stores 0 in `x` and then tests 0, which counts as false, so the `if` never runs.

## Practice

:::problem id=prac-type-widths title="Widths of the four integer types" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Answer for this course's machines (64-bit Linux).

:::check id=prac-type-widths-q1
`sizeof(char)`, `sizeof(short)`, `sizeof(int)`, and `sizeof(long)` are {{=1, 2, 4, 8|1, 2, 4, 4|4, 4, 4, 8}}.

`char` is always 1 byte. On these machines `short`, `int`, and `long` are 2, 4, and 8 bytes.
:::

:::check id=prac-type-widths-q2
When 42 is stored in a bigger type, the extra bits on the left are {{=zeros|ones|part of the byte order}}.

42 is `101010`. A bigger box adds zeros on the left. (A negative number would get ones.)
:::

:::check id=prac-type-widths-q3
A program that must work on any computer should use `sizeof` because

- [x] Sizes other than `char` can be different on different computers
- [ ] `sizeof` turns a `short` into a `long` while the program runs
- [ ] Division only works on the result of `sizeof`

`sizeof` tells you the real size on the machine the program runs on. A fixed-size type such as `int32_t` is the other safe choice.
:::
:::

:::problem id=prac-char-values title="Letter and code" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Assume a normal ASCII machine.

:::check id=prac-char-values-q1
`printf("%d\n", c1)` with `char c1 = 'a'` prints {{=97|a|98}}.

`%d` prints the number. In ASCII, `'a'` has code 97.
:::

:::check id=prac-char-values-q2
`char c2 = 98` stores the same value as {{='b'|'a'|98.0}}.

In ASCII, `'b'` has code 98, so both store the same byte.
:::
:::

:::problem id=prac-two-divisions title="Integer 5/2 and floating 5.0/2.0" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-two-divisions-q1
`5 / 2` with two `int`s gives {{=2|2.5|0}}.

Both are whole numbers, so the fractional part is thrown away.
:::

:::check id=prac-two-divisions-q2
`5.0 / 2.0` with two `double`s gives {{=2.5|2|5}}.

With `double`, the fraction is kept. 2.5 can be stored exactly.
:::

:::check id=prac-two-divisions-q3
Which statement about `double` division is correct?

- [x] The result is rounded to the closest number a `double` can hold, so it is not always exact
- [ ] It throws away the fraction, just like `int` division
- [ ] 2.5 cannot be stored in a `double`

`double` division keeps the fraction, but it must round to a number the type can store. For `5.0 / 2.0` that is exactly 2.5; for `1.0 / 3.0` it is only close.
:::
:::

:::problem id=prac-scanf-ampersand title="Why scanf receives an address" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-scanf-ampersand-q1
`scanf("%d", &x)` uses `&x` because `scanf` {{=writes the number it reads into x|prints x|computes sizeof(x)}}.

To write into `x`, `scanf` needs to know where `x` is in memory. `&x` is that address.
:::

:::check id=prac-scanf-ampersand-q2
The format `" %c"` starts with a space so that `scanf` {{=skips spaces and newlines before reading one character|reads two characters|stores the character in a float}}.

The Enter key from the previous input leaves a newline behind. Without the space, `%c` would read it.
:::

:::check id=prac-scanf-ampersand-q3
To use `printf` and `scanf`, you must include {{=stdio.h|stdlib.h|math.h}}.

`stdio.h` ("standard input/output") is where both are declared.
:::
:::

:::problem id=prac-float-bits title="Read the float bit groups" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The `float` 3.61 is stored as `0 10000000 11001110000101000111101`.

:::check id=prac-float-bits-q1
The three groups are {{=sign, exponent, fraction|the four bytes of the integer 361|padding followed by a decimal}}.

1 bit of sign, 8 bits of exponent, and 23 bits of fraction: 32 bits in total.
:::

:::check id=prac-float-bits-q2
The sign bit says the number is {{=positive|negative|an integer}}.

The first bit is 0, which means positive.
:::
:::

**Next:** [Memory and pointers](topic:memory-and-pointers) looks at memory itself: how every byte has an address, and how a variable can hold an address.
