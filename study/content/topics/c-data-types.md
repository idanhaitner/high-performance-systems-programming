---
id: c-data-types
title: Values and types
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/02-types/lesson.md
  - c/03-expressions/lesson.md
---

A type determines three things: how many bytes an object occupies, what its bits mean, and which machine operation the compiler uses on it. The sizes in this lesson are those of the course platform, 64-bit Linux (the LP64 model): `char` is 1 byte, `short` is 2, `int` is 4, and `long` is 8. Only `sizeof(char) == 1` is guaranteed everywhere; 64-bit Windows, for example, makes `long` 4 bytes. A program that needs a width asks `sizeof`.

## Integer representation

:::definition id=def-int-widths title="Integer widths on this platform" source="Lecture 1 - Introduction.pdf"
`sizeof(char)` is 1 by the C standard. On this platform, `short` occupies 2 bytes, `int` occupies 4, and `long` occupies 8. `unsigned int` has the same width as `int`.
:::

The value 42 fits in every one of these widths. In binary it is `101010`, and a wider type fills the extra high bits with zeros. That holds for non-negative values only: a negative value in two's complement fills them with ones. The comments below write the bits from most to least significant; they say nothing about which byte the machine stores at the lowest address.

```c
char a = 42;   /* 00101010 */
short b = 42;  /* 00000000 00101010 */
int c = 42;    /* four bytes, ending in 00101010 */
long d = 42;   /* eight bytes, ending in 00101010 */
```

![The value 42 stored in a char, a short, an int, and a long.](../assets/figures/integer-widths.svg)

The addresses in the figure are examples. Separately declared variables need not be adjacent, and the compiler may keep them in registers instead of memory.

:::definition id=def-integer-division title="Integer division" source="c/03-expressions/lesson.md"
When both operands of `/` have integer type, the result is the algebraic quotient with the fractional part discarded. The result is truncated toward zero.
:::

```c
int x = 5;
int y = 2;
x = x / y; /* 2 */
```

The mathematical quotient is $2.5$, so the C result is 2. Truncation toward zero gives `-5 / 2 == -2`, not $-3$. The remainder operator `%` is defined so that `a == (a / b) * b + a % b`; as a result, `a % b` has the sign of `a` (for example, `-5 % 2 == -1`). Division or remainder by zero is undefined behavior.

:::problem id=worked-integer-division title="5 divided by 2 in int" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
What is `x` after `int x = 5; int y = 2; x = x / y;`? State the rule for a negative quotient as well.

:::solution
`x` is 2. Both operands have integer type, so `/` truncates toward zero. The fractional part of $2.5$ is discarded. The same rule makes `-5 / 2` equal `-2`.
:::
:::

:::trap
Copying a width from this page into a program intended for another ABI. `sizeof(char)` is portable. The widths of `int` and `long` are not. `sizeof`, or a fixed-width type such as `int32_t`, is the explicit choice.
:::

## Characters and small integers

:::definition id=def-char-code title="Character constant" source="Lecture 1 - Introduction.pdf"
A character constant such as `'a'` has type `int`. Its value is the numeric code of that character in the execution character set. On an ASCII-compatible machine, `'a'` is 97 and `'b'` is 98.
:::

```c
char c1 = 'a';
char c2 = 98;          /* same value as 'b' on this machine */
printf("%c\n", c1);    /* a */
printf("%d\n", c1);    /* 97 */
```

A `char` passed to `printf` is promoted to `int`. `%c` prints that number as a character, and `%d` prints it as a decimal integer. C guarantees only that the digits `'0'` through `'9'` have consecutive codes; the value 97 for `'a'` comes from ASCII, not from the C standard. Whether plain `char` is signed or unsigned is up to the platform, so a byte above 127 may promote to a negative `int` on one machine and a positive one on another.

:::check id=chk-char-code
On an ASCII-compatible machine, what does `printf("%d\n", c1)` print when `c1` holds `'a'`?

- [ ] a
- [x] 97
- [ ] 98

`%d` prints the integer code. In ASCII, `'a'` is 97. `%c` would print the letter.
:::

## Floating-point representation

:::definition id=def-float-widths title="float and double" source="Lecture 1 - Introduction.pdf"
On this platform `float` occupies 4 bytes and `double` occupies 8. The course machines use IEEE-754 binary32 and binary64: one sign bit, an exponent field, and a fraction field.
:::

For the finite normal value 3.61, the binary32 fields are:

```text
float x = 3.61f;
/* 0 10000000 11001110000101000111101 */
/* 1 sign bit, 8 exponent bits, 23 fraction bits */
```

For 42.8 in binary64:

```text
double y = 42.8;
/* 0 10000000100 0101011001100110011001100110011001100110011001100110 */
/* 1 sign bit, 11 exponent bits, 52 fraction bits */
```

A sign bit of 0 means positive. The exponent is stored with a bias: 127 for binary32 and 1023 for binary64. The field `10000000` is 128, so the exponent is $128 - 127 = 1$ and $3.61 = 1.805 \times 2^{1}$. The field `10000000100` is 1028, so the exponent is $1028 - 1023 = 5$ and $42.8 = 1.3375 \times 2^{5}$. The fraction field holds the binary digits after the leading 1, which is implied and not stored. Neither 3.61 nor 42.8 has a finite binary expansion, so both stored values are the nearest representable numbers, not the exact decimals.

```c
double x = 5.0;
double y = 2.0;
x = x / y; /* 2.5 */
```

Here 5.0, 2.0, and 2.5 are all exactly representable in binary, so the result equals the real quotient. For other values, such as `1.0 / 3.0`, the result is rounded to the nearest representable number. Integer division and floating division are different operations: `5 / 2` is the integer 2, while `5.0 / 2.0` is the floating value 2.5.

:::trap
Reading the bits of the `float` 3.61 as if they stored the digits 3, 6, 1. They hold a sign, an exponent, and a binary fraction. The lost $3.14$ in the previous lesson is this encoding running out of fraction bits.
:::

## The sizeof operator

:::definition id=def-sizeof title="sizeof" source="Lecture 1 - Introduction.pdf"
`sizeof` is a unary operator. It yields the number of bytes in its operand, which may be an expression or a parenthesized type. The result has type `size_t`.
:::

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

On this platform the lines print:

```text
2, 4, 8
4
```

`%zu` is the `printf` conversion for `size_t`. Using `%d`, which expects an `int`, is undefined behavior. The parentheses are required only around a type name: `sizeof x` and `sizeof(int)` are both correct.

:::problem id=worked-sizeof-sample title="sizeof of short, int, and long" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
What does the program print on this platform, and which conversion prints a `sizeof` result?

:::solution
The first call prints `2, 4, 8` for `short`, `int`, and `long`. The second prints `4`, the size of `int`. The conversion is `%zu` because `sizeof` yields `size_t`. These widths, except for `char`, are platform measurements.
:::
:::

## Formatted input and output

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

`printf` receives values to print. `scanf` receives pointers, because it must write into the caller's variables. `scanf` returns the number of items it stored, or `EOF` if input ends first, so comparing the result with the expected count catches bad or missing input. For the input `5`, `3.5`, and `b`, the program prints `x=5, y=3.500000, z=b`; `%f` shows six digits after the decimal point by default.

The space in `" %c"` matters. After `%f` reads `3.5`, the newline typed after it is still waiting in the input. `%c` reads any character, whitespace included, so without the space it would store that newline. A space in the format tells `scanf` to skip whitespace first. (`%d` and `%f` already skip leading whitespace on their own.)

### Control statements

C's control statements are `if`/`else` and `switch` for choosing, `for`, `while`, and `do`/`while` for repeating, and `break`, `continue`, and `return` for leaving a loop or a function early. A condition compares with `==`; a single `=` is assignment, so `if (x = 0)` assigns 0 and is always false.

## Practice

:::problem id=prac-type-widths title="Widths of the four integer types" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use this course platform for the measurements.

:::check id=prac-type-widths-q1
`sizeof(char)`, `sizeof(short)`, `sizeof(int)`, and `sizeof(long)` are {{=1, 2, 4, 8|1, 2, 4, 4|4, 4, 4, 8}}.

`sizeof(char)` is 1 in standard C. On this LP64 platform the other three sizes are 2, 4, and 8.
:::

:::check id=prac-type-widths-q2
In the representation of the non-negative value 42, the unused high bits are {{=zeros|ones|part of the byte order}}.

42 is `101010` in binary. A wider type extends a non-negative value with zero bits; a negative value would be extended with ones.
:::

:::check id=prac-type-widths-q3
A portable program discovers a width with `sizeof` because

- [x] Widths other than `sizeof(char)` can differ between ABIs
- [ ] `sizeof` changes a `short` into a `long` at run time
- [ ] Integer division is legal only on the result of `sizeof`

`sizeof` reports the operand's size in bytes. Fixed-width types such as `int32_t` are the other explicit choice.
:::
:::

:::problem id=prac-char-values title="Letter and code" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Assume an ASCII-compatible execution character set.

:::check id=prac-char-values-q1
`printf("%d\n", c1)` with `char c1 = 'a'` prints {{=97|a|98}}.

`%d` prints the code after promotion. ASCII assigns 97 to `'a'`. C does not require that code on every execution character set.
:::

:::check id=prac-char-values-q2
`char c2 = 98` stores the same value as {{='b'|'a'|98.0}}.

On this character set, `'b'` has code 98, so the two initializers store the same byte.
:::
:::

:::problem id=prac-two-divisions title="Integer 5/2 and floating 5.0/2.0" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-two-divisions-q1
Integer division of 5 by 2 yields {{=2|2.5|0}}.

Both operands have integer type, so the result is truncated toward zero.
:::

:::check id=prac-two-divisions-q2
`double` division of 5.0 by 2.0 yields {{=2.5|2|5}}.

5.0, 2.0, and 2.5 are exact in binary floating point, so this division does not round away from the real quotient.
:::

:::check id=prac-two-divisions-q3
Which statement about floating division is correct?

- [x] The result is rounded to a representable value, so for other inputs it can differ from the exact quotient
- [ ] `double` division always truncates toward zero in the same way as `int` division
- [ ] 2.5 cannot be stored in a `double`

Integer division discards the fraction by rule. Floating division rounds to the nearest representable value; for 5.0 / 2.0 that value is exactly 2.5.
:::
:::

:::problem id=prac-scanf-ampersand title="Why scanf receives an address" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
:::check id=prac-scanf-ampersand-q1
`scanf("%d", &x)` passes `&x` because `scanf` {{=writes the converted input into x|prints x|computes sizeof(x)}}.

The conversion stores through the pointer it receives. `printf` receives the value to print. The return value should be checked: one successful `%d` conversion returns 1.
:::

:::check id=prac-scanf-ampersand-q2
The format `" %c"` has a leading space so that `scanf` {{=skips whitespace before reading one character|reads two characters|stores the character in a float}}.

A preceding conversion can leave a newline in the input. `%c` would store it. The space directive skips whitespace first.
:::

:::check id=prac-scanf-ampersand-q3
The header required for `printf` and `scanf` is {{=stdio.h|stdlib.h|math.h}}.

Both functions are declared by `<stdio.h>`.
:::
:::

:::problem id=prac-float-bits title="Read the float bit groups" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The IEEE-754 binary32 encoding of 3.61 is `0 10000000 11001110000101000111101`.

:::check id=prac-float-bits-q1
Those three groups are {{=sign, exponent, fraction|the four bytes of the integer 361|padding followed by a decimal}}.

The widths are 1, 8, and 23 bits, which account for all 32 bits of a binary32 value.
:::

:::check id=prac-float-bits-q2
The sign bit of that pattern says the value is {{=positive|negative|an integer}}.

The sign bit is 0. The remaining fields are the biased exponent and the fraction.
:::
:::

[Memory and pointers](topic:memory-and-pointers) uses these widths as the distances between addresses.
