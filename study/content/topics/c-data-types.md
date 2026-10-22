---
id: c-data-types
title: Data types and sizeof
sources:
  - "Lecture 1 - Introduction.pdf"
---

Pointer arithmetic multiplies by the size of a type, and the process image stores those bytes in `.data`, `.bss`, the stack, or `.rodata`. This chapter fixes the widths, the difference between integer and floating division, and the `scanf` rule that a write needs an address.

## Integer types

On this machine each integer type has a fixed width. The value 42 is stored in the low bits. Every extra bit on the left is 0.

:::definition id=def-int-widths title="Integer widths" source="Lecture 1 - Introduction.pdf"
`char` is 1 byte, `short` is 2 bytes, `int` is 4 bytes, and `long` is 8 bytes. The result of an integer calculation is an integer.
:::

```c
char a = 42;   /* 00101010 */
short b = 42;  /* 00000000 00101010 */
int c = 42;    /* 00000000 00000000 00000000 00101010 */
long d = 42;   /* eight bytes, the last of them 00101010 */
```

`a` sits at address 1000, `b` at 1002, `c` at 1024, and `d` at 1032. Each address labels a separate object, and the address shows that object's width. The gap between 1000 and 1024 holds none of these four objects.

![42 stored in a char, a short, an int, and a long, with zero bytes on the left.](../assets/figures/integer-widths.svg)

```c
int x = 5;
int y = 2;
x = x / y; /* 5 / 2 = 2 */
```

:::theorem id=thm-int-div title="Integer division discards the fraction" source="Lecture 1 - Introduction.pdf"
If `x` and `y` are `int` values 5 and 2, then `x / y` is 2.

:::proof
**Intuition.** Both operands are integers, so the operation stays inside the integers. There is no place in the result type for the `.5`.

**Proof.** The result of an integer calculation is an integer, and `5 / 2` is `2`. The mathematical quotient is $2.5$. The integer result keeps the whole number of times 2 fits into 5, which is 2.

**What the proof used.** The rule that an integer calculation yields an integer, and the quotient `5 / 2 = 2`.
:::
:::

:::problem id=worked-integer-division title="5 divided by 2 in int" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
What is the value of `x` after `int x = 5; int y = 2; x = x / y;`?

:::solution
`x` is 2. Both operands are `int`, so the division is an integer calculation and the fractional part is discarded.
:::
:::

:::trap
A common mistake is to treat these widths as fixed by the C language on every machine. Sizes of data types can vary across architectures and operating systems. These widths are the model used here. `sizeof` is how a program detects the widths of the machine it is running on.
:::

## Characters are small integers

:::definition id=def-char-code title="char as a small integer" source="Lecture 1 - Introduction.pdf"
`char` stores a character code, and it also stores a small integer. The code for `'a'` is 97, and `char c2 = 98` is the same cell as `'b'`.
:::

```c
char c1 = 'a';
char c2 = 98;          /* same value as 'b' */
printf("%c\n", c1);    /* a */
printf("%d\n", c1);    /* 97 */
```

`%c` prints the character. `%d` prints the integer code. Use `char` for characters, and remember that the cell is still an integer width of one byte.

:::check id=chk-char-code
What does `printf("%d\n", c1)` print when `c1` holds `'a'`?

- [ ] a
- [x] 97
- [ ] 98

`%d` prints the integer code. The code for `'a'` is 97. `%c` would print the letter.
:::

## Floating-point types

:::definition id=def-float-widths title="float and double" source="Lecture 1 - Introduction.pdf"
`float` is 4 bytes and `double` is 8 bytes. Their bits are a sign, an exponent field, and a fraction field, which is a different representation from the integer types.
:::

The bits of two literals, grouped as sign, exponent, fraction:

```text
float x = 3.61;
/* 0 10000000 11001110000101000111101 */
/* 1 sign bit, 8 exponent bits, 23 fraction bits */

double y = 42.8;
/* 0 10000000100 0101011001100110011001100110011001100110011001100110 */
/* 1 sign bit, 11 exponent bits, 52 fraction bits */
```

The sign bit 0 means positive. The exponent field is stored with a bias, 127 for `float` and 1023 for `double`, so the field `10000000` (128) means a true power of $2^1$, and the field `10000000100` (1028) means a true power of $2^5$. The fraction bits fill in the significand. That encoding is why a `float` is not "an integer with a decimal point moved". The first chapter's failure of associativity is this representation running out of fraction bits.

```c
double x = 5.0;
double y = 2.0;
x = x / y; /* 5.0 / 2.0 = 2.5 */
```

This quotient lands on the mathematical result. $5.0$, $2.0$, and $2.5$ are all exact in binary floating point. A different pair of values can round to a representable number that differs from the real quotient. Integer `5 / 2` is defined to be the integer 2. Floating `5.0 / 2.0` rounds a real division, and for these two values the rounding changes nothing.

:::trap
A `float`'s bits are a sign, an exponent, and a fraction. `3.61` as a `float` uses the sign, exponent, and fraction pattern shown with it. The low bits are a fraction. They are not the integer 361.
:::

## The sizeof operator

:::definition id=def-sizeof title="sizeof" source="Lecture 1 - Introduction.pdf"
`sizeof` is a unary operator. It returns the number of bytes required to store its operand. The operand may be a variable or a type.
:::

```c
#include <stdio.h>

int main() {
    short x;
    int y;
    long z;
    printf("%d, %d, %d\n", sizeof(x), sizeof(y), sizeof(z));
    printf("%d\n", sizeof(int));
    return 0;
}
```

On this machine the two lines print:

```text
2, 4, 8
4
```

That is `short`, `int`, `long`, and then `sizeof(int)` again. `sizeof` is the measurement you use when the widths might differ on another architecture. The format in the program is `%d`. The number to learn is the byte count it prints.

:::problem id=worked-sizeof-sample title="sizeof of short, int, and long" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
What does this `sizeof` program print?

:::solution
The first `printf` prints `2, 4, 8` for `sizeof(x)`, `sizeof(y)`, and `sizeof(z)` when `x` is `short`, `y` is `int`, and `z` is `long`. The second prints `4`, which is `sizeof(int)`.
:::
:::

## Input, output, and control flow

```c
#include <stdio.h>

int main() {
    int x;
    float y;
    char z;

    printf("Enter integer number\n");
    scanf("%d", &x);
    printf("Enter float point number\n");
    scanf("%f", &y);
    printf("Enter character\n");
    scanf(" %c", &z);

    printf("x=%d, y=%f, z=%c\n", x, y, z);
    return 0;
}
```

`printf` writes. `scanf` reads. Both require `#include <stdio.h>`. The format string selects the conversion, The calls are `scanf("%…", &variable)` and `printf("%…", variable)`. `scanf` is given an address because it writes into the caller's object. `printf` is given the value.

The space in `" %c"` is there on purpose. A previous `scanf` leaves the newline in the input. A conversion `%c` would read that newline as the character. The leading space in the format asks `scanf` to skip whitespace first. A sample run reads `5`, then `3.5`, then `b`, and prints `x=5, y=3.5, z=b`. The build is `gcc main.c` and `./a.out`.

C's control-flow commands:

| Name | Role |
| --- | --- |
| `if`-`else`, `switch`-`case` | decision making |
| `for`, `while`, `do`-`while` | loops |
| `break`, `continue`, `return` | branching |

## Practice

:::problem id=prac-type-widths title="Widths of the four integer types" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Use these widths.

:::check id=prac-type-widths-q1
`sizeof(char)`, `sizeof(short)`, `sizeof(int)`, and `sizeof(long)` are {{=1, 2, 4, 8|1, 2, 4, 4|4, 4, 4, 8}}.

42 is stored in 1, 2, 4, and 8 bytes, and the `sizeof` program prints 2, 4, 8 for `short`, `int`, and `long`.
:::

:::check id=prac-type-widths-q2
The bits to the left of 42 in a `short`, an `int`, or a `long` are {{=zeros|ones|the sign of the type's name}}.

The extra leading bits on the left are filled with zeros.
:::

:::check id=prac-type-widths-q3
A program should discover widths with `sizeof` because

- [x] Those widths can vary across architectures and operating systems
- [ ] `sizeof` changes a `short` into a `long` at run time
- [ ] Integer division is only legal on the result of `sizeof`

The operator reports the storage of its operand on the machine where it is evaluated.
:::
:::

:::problem id=prac-char-values title="Letter and code" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-char-values-q1
`printf("%d\n", c1)` with `char c1 = 'a'` prints {{=97|a|98}}.

`%d` prints the code. The code for `'a'` is 97.
:::

:::check id=prac-char-values-q2
`char c2 = 98` stores the same value as {{='b'|'a'|98.0}}.

`char c2 = 98` is equivalent to `c2 = 'b'`.
:::
:::

:::problem id=prac-two-divisions title="Integer 5/2 and floating 5.0/2.0" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-two-divisions-q1
`int` division of 5 by 2 yields {{=2|2.5|0}}.

The result of an integer calculation is an integer. `5 / 2` is `2`.
:::

:::check id=prac-two-divisions-q2
`double` division of 5.0 by 2.0 yields {{=2.5|2|5}}.

For the `double` version, `5.0 / 2.0` is `2.5`.
:::

:::check id=prac-two-divisions-q3
Which statement about floating division is true?

- [x] A floating result is a representable value, so a different pair of inputs can fail to match the real quotient
- [ ] `double` division always truncates the same way `int` division does
- [ ] 2.5 cannot be stored in a `double`

5.0, 2.0, and 2.5 fit exactly, so this division prints 2.5. A floating result is still a representable value, so a different pair of inputs can miss the real quotient.
:::
:::

:::problem id=prac-scanf-ampersand title="Why scanf receives an address" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
:::check id=prac-scanf-ampersand-q1
`scanf("%d", &x)` passes `&x` because scanf {{=writes into x|prints x|computes sizeof(x)}}.

The conversion stores the input in the object whose address it was given. `printf` receives the value instead.
:::

:::check id=prac-scanf-ampersand-q2
The format `" %c"` has a leading space so that scanf {{=skips whitespace before reading the character|reads two characters|stores the character in a float}}.

A previous line of input leaves a newline. `%c` would take that newline. The space skips it. The sample then reads `b`.
:::

:::check id=prac-scanf-ampersand-q3
The header required for `printf` and `scanf` is {{=stdio.h|stdlib.h|math.h}}.

`printf` and `scanf` require `#include <stdio.h>`.
:::
:::

:::problem id=prac-float-bits title="Read the float bit groups" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`float` 3.61 is encoded as `0 10000000 11001110000101000111101`.

:::check id=prac-float-bits-q1
Those three groups are {{=sign, exponent, fraction|the four bytes of an int 361|MSB padding, then the integer 3.61}}.

The groups have widths 1, 8, and 23, which fill the 32 bits of a `float`.
:::

:::check id=prac-float-bits-q2
The sign bit of that pattern says the value is {{=positive|negative|an integer}}.

The sign bit is 0. A `float` uses the remaining bits for the exponent and the fraction.
:::
:::

Structures pack several of these types into one object. [Structures](topic:structures) keeps the field order, the widths, and the address rule for `scanf` together.
