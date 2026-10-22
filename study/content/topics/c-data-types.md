---
id: c-data-types
title: Values and types
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/02-types/lesson.md
  - c/03-expressions/lesson.md
---

A type determines the size of an object, the meaning of its bits, and the operation a compiler selects. The sizes below, other than `sizeof(char)`, belong to the LP64 platform used in this course: `char` is 1 byte, `short` is 2, `int` is 4, and `long` is 8. Another ABI can give `long` a different width. A program that needs the width uses `sizeof`.

## Integer representation

:::definition id=def-int-widths title="Integer widths on this platform" source="Lecture 1 - Introduction.pdf"
`sizeof(char)` is 1 by the C standard. On this platform, `short` occupies 2 bytes, `int` occupies 4, and `long` occupies 8. `unsigned int` has the same width as `int`.
:::

The non-negative value 42 fits in every one of these widths. In the usual binary representation its significant bits are `101010`, and the unused high bits are zero. That describes this positive value. It is not a rule about negative values, and it says nothing about which byte a machine stores at the lowest address.

```c
char a = 42;   /* 00101010 */
short b = 42;  /* 00000000 00101010 */
int c = 42;    /* four bytes, ending in 00101010 */
long d = 42;   /* eight bytes, ending in 00101010 */
```

![The value 42 stored in a char, a short, an int, and a long.](../assets/figures/integer-widths.svg)

Addresses drawn for these objects are examples. The gap between two separately declared objects is not part of either object, and the compiler may place them in registers rather than memory.

:::definition id=def-integer-division title="Integer division" source="c/03-expressions/lesson.md"
When both operands of `/` have integer type, the result is the algebraic quotient with the fractional part discarded. The result is truncated toward zero.
:::

```c
int x = 5;
int y = 2;
x = x / y; /* 2 */
```

The mathematical quotient is $2.5$. The C result is 2. The same rule gives `-5 / 2 == -2`, not $-3$. The remainder operator satisfies `a == (a / b) * b + (a % b)` when the division is defined, and the remainder takes the sign of `a`. Division by zero is undefined behavior.

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

`%c` prints the character and `%d` prints the promoted integer value. C requires the codes of `'0'` through `'9'` to be contiguous. It does not require the letters to use ASCII codes, so 97 is a property of this execution character set. Plain `char` may be signed or unsigned. A value above 127 can therefore behave differently when promoted to `int`.

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

A sign bit of 0 means positive. The exponent is stored with a bias, 127 for binary32 and 1023 for binary64. The field `10000000` is 128, so the unbiased power is $2^{1}$. The field `10000000100` is 1028, so the unbiased power is $2^{5}$. The fraction supplies the bits after the leading 1. This is not an integer with a decimal point inserted.

```c
double x = 5.0;
double y = 2.0;
x = x / y; /* 2.5 */
```

Here 5.0, 2.0, and 2.5 are all exact binary fractions, so the rounded result matches the real quotient. Another pair of values can round to a different representable number. Integer division and floating division are different operations: `5 / 2` is the integer 2, while `5.0 / 2.0` is the floating value 2.5.

:::trap
Reading the fraction bits of a `float` as the integer 361. Those bits belong to a sign-exponent-fraction encoding. The associativity example in the previous lesson is this encoding running out of fraction bits.
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

`%zu` is the conversion for `size_t`. `%d` expects `int` and is the wrong conversion. `sizeof(char)` is 1 on every platform. The other three numbers are measurements of this one.

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

`printf` receives values. `scanf` receives pointers because it writes the caller's objects. Each conversion that assigns a value must be checked: `scanf` returns the number of assigned inputs, or `EOF` on input failure. A sample that supplies `5`, `3.5`, and `b` prints `x=5, y=3.500000, z=b` under the default `%f` precision.

The space in `" %c"` is significant. A prior numeric conversion leaves the following newline unread. `%c` would store that newline. A leading space in the format skips whitespace first.

The basic control statements are `if`/`else` and `switch` for selection, `for`, `while`, and `do`/`while` for iteration, and `break`, `continue`, and `return` for leaving a loop or a function. A condition uses `==` for comparison. A single `=` assigns.

## Practice

:::problem id=prac-type-widths title="Widths of the four integer types" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Use this course platform for the measurements.

:::check id=prac-type-widths-q1
`sizeof(char)`, `sizeof(short)`, `sizeof(int)`, and `sizeof(long)` are {{=1, 2, 4, 8|1, 2, 4, 4|4, 4, 4, 8}}.

`sizeof(char)` is 1 in standard C. On this LP64 platform the other three sizes are 2, 4, and 8.
:::

:::check id=prac-type-widths-q2
In the representation of the non-negative value 42, the unused high bits are {{=zeros|ones|part of the byte order}}.

The significant bits of 42 are `101010`. Wider positive representations extend that pattern with zero bits. This does not describe a negative value or the order of bytes in memory.
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

- [x] The result is a representable value, so another pair of inputs can differ from the real quotient
- [ ] `double` division always truncates toward zero in the same way as `int` division
- [ ] 2.5 cannot be stored in a `double`

Integer division discards a fraction by rule. Floating division rounds to the format. This particular input rounds to the exact value 2.5.
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
