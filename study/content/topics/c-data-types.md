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
On a normal ASCII machine, `'a'` is 97 and the letters follow in order. What does `printf("%d\n", 'c')` print?

- [ ] c
- [x] 99
- [ ] 97

`%d` prints the number. `'a'` is 97, `'b'` is 98, so `'c'` is 99. `%c` would print the letter `c`.
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
How many bytes do `int a[10]` and `long b[10]` take together? {{=120|80|20}}

Ten `int`s are $10 \times 4 = 40$ bytes, and ten `long`s are $10 \times 8 = 80$ bytes: 120 in total.
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
Assume a normal ASCII machine, where `'A'` is 65 and `'a'` is 97.

:::check id=prac-char-values-q1
`printf("%c\n", 66)` prints {{=B|66|b}}.

`%c` shows the number as a character. 65 is `'A'`, so 66 is `'B'`.
:::

:::check id=prac-char-values-q2
`printf("%d\n", 'a' - 'A')` prints {{=32|0|1}}.

Characters are numbers, so you can subtract them: $97 - 65 = 32$. Every lowercase letter is 32 more than its uppercase partner.
:::
:::

:::problem id=prac-two-divisions title="Integer 7/2 and floating 7.0/2.0" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-two-divisions-q1
`7 / 2` with two `int`s gives {{=3|3.5|4}}.

$7 \div 2 = 3.5$, and the fractional part is thrown away. C does not round up to 4.
:::

:::check id=prac-two-divisions-q2
`-7 / 2` with two `int`s gives {{=-3|-4|-3.5}}.

The true answer is $-3.5$. Throwing away the fraction moves toward zero, so the result is $-3$, not $-4$.
:::

:::check id=prac-two-divisions-q3
`7 % 2` gives {{=1|3|0}}.

$7 = 3 \times 2 + 1$, so the remainder is 1.
:::

:::check id=prac-two-divisions-q4
`7.0 / 2.0` with two `double`s gives {{=3.5|3|4}}.

With `double`, the fraction is kept.
:::
:::

:::problem id=prac-scanf-ampersand title="Why scanf receives an address" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-scanf-ampersand-q1
Someone writes `scanf("%d", n)`, forgetting the `&`. What goes wrong?

- [x] `scanf` receives the value in `n` instead of where `n` is, so it writes to the wrong place
- [ ] Nothing: `scanf` adds the `&` itself
- [ ] `scanf` prints `n` instead of reading it

`scanf` treats whatever it receives as an address. Without `&`, it gets a number that is not `n`'s address, which is undefined behavior. Compilers usually warn about it.
:::

:::check id=prac-scanf-ampersand-q2
A program reads `scanf("%d", &n)` and then `scanf("%c", &answer)` (no space before `%c`). The user types `5`, presses Enter, then types `y`. `answer` holds {{=a newline character|y|5}}.

The Enter after `5` is still waiting, and `%c` reads any character, including that newline. Writing `" %c"` would skip it and read `y`.
:::

:::check id=prac-scanf-ampersand-q3
If the user types `abc` for `scanf("%d", &n)`, the call returns {{=0|1|-1}}.

`scanf` returns how many values it read. `abc` is not a number, so it read none.
:::
:::

:::problem id=prac-float-bits title="Read the float bit groups" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The lesson showed the bits of `3.61f`. Here are the bits of `-3.61f`: `1 10000000 11001110000101000111101`.

:::check id=prac-float-bits-q1
The three groups are {{=sign, exponent, fraction|the four bytes of the integer 361|padding followed by a decimal}}.

1 bit of sign, 8 bits of exponent, and 23 bits of fraction: 32 bits in total.
:::

:::check id=prac-float-bits-q2
Compared with `3.61f`, the only bit that changed is {{=the sign bit|the last fraction bit|the first exponent bit}}.

$3.61$ and $-3.61$ have the same size, so the exponent and fraction are the same. Only the first bit, the sign, flips from 0 to 1.
:::
:::

**Next:** [Memory and pointers](topic:memory-and-pointers) looks at memory itself: how every byte has an address, and how a variable can hold an address.
