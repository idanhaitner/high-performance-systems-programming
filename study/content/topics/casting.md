---
id: casting
title: "Changing a value's type: casting"
sources:
  - "ps2.pdf"
---

In Lecture 1 you saw that every C type is a box of a fixed size. Sometimes a value has to move into a box of another type, like an `int` into a `double`, or a big number into a small box. This first lesson of Lecture 2 shows how that happens and what can go wrong. It matters because the program does not stop or warn you when a number changes on the way. You just get a different number.

## Two ways a type changes

Think of pouring water. Pouring a cup into a bucket is always safe. Pouring a bucket into a cup can spill.

Moving a value to another type is called a **conversion**. The first way happens by itself:

```c
int i = 42;
double d = i;   /* d is 42.0 */
```

`d` is a `double`, so C turns the `int` 42 into the `double` 42.0 for you. You wrote nothing special. This is an **implicit conversion**: one the compiler does without being asked.

The second way is one you write yourself, by putting a type name in parentheses in front of a value:

```c
double pi = 3.14159;
int whole = (int)pi;   /* whole is 3 */
```

`(int)pi` means "give me this value as an `int`". `int` has no room for a fraction, so `whole` is 3. This is an **explicit conversion**, usually called a **cast**.

:::definition id=def-cast title="Cast" source="ps2.pdf"
A cast is a type name in parentheses in front of a value, like `(int)x`. It asks for that value converted to that type. It tells the reader and the compiler that you meant it, but it does not protect the value from changing.
:::

### Going from double to int

A cast from `double` to `int` drops the fraction. It does not round: `(int)3.99` is 3, and `(int)-3.99` is -3. If the whole part is too big for an `int`, the C rules do not say what happens, so you must avoid that.

### A cast that fixes division

You met this trap in [Values and types](topic:c-data-types): `/` between two `int`s throws away the fraction. A cast is the usual fix:

```c
int total = 7, count = 2;
double wrong = total / count;           /* 3.0 */
double right = (double)total / count;   /* 3.5 */
```

- In the `wrong` line, `total / count` is whole-number division, which gives 3. Only then does it become 3.0. The fraction was already gone.
- In the `right` line, the cast applies to `total` first. Now one side of `/` is a `double`, so C converts `count` to a `double` too and keeps the fraction.

:::check id=chk-cast-division
`int a = 9, b = 2;` Which line stores 4.5 in `double x`?

- [x] `x = (double)a / b;`
- [ ] `x = (double)(a / b);`
- [ ] `x = a / b;`

In `(double)(a / b)`, the parentheses make the whole-number division run first, which gives 4, so the cast comes too late. `a / b` alone has the same problem. `(double)a` makes it a decimal division from the start.
:::

## Types with an exact size

The next examples need types whose size never changes. The header `<stdint.h>` gives you these names:

| Name | Size | Holds |
| --- | --- | --- |
| `uint8_t` | 1 byte | 0 to 255 |
| `int8_t` | 1 byte | -128 to 127 |
| `int32_t` | 4 bytes | about -2 billion to 2 billion |

The `u` stands for **unsigned**: the type has no negative numbers. The number in the name is the size in bits.

## Big into small: bits are cut off

What happens when a number does not fit?

```c
int32_t a = 300;
uint8_t b = (uint8_t)a;
printf("%d\n", b);   /* prints 44 */
```

Why 44? Look at the bits. 300 is $256 + 44$, and it takes four bytes:

![The four bytes of 300. The three on the left are thrown away. The last byte, 00101100, stays and is worth 44.](../assets/figures/cast-truncation.svg)

`uint8_t` has room for one byte, so only the rightmost byte stays. The other three are thrown away. What is left is `00101100`, which is $32 + 8 + 4 = 44$. This is called **truncation**.

So the rule for `uint8_t` is: divide by 256 and keep the remainder. That means 256 becomes 0, 257 becomes 1, and 300 becomes 44.

:::definition id=def-truncation title="Truncation" source="ps2.pdf"
Truncation is what happens when a whole number moves into a smaller type: the leftmost bits are thrown away, and the bits that remain are read as the new type. The program gives no message.
:::

:::check id=chk-cast-256
What does `(uint8_t)260` give?

- [x] 4
- [ ] 255
- [ ] 260

260 is $256 + 4$, and only the last byte stays, so the answer is 4. The value does not stop at the largest number the type can hold, which would be 255.
:::

## Same bits, new meaning: unsigned to signed

A number can also change when it fits in the same number of bytes. Here is one byte moved from an unsigned type to a signed one, meaning a type that can hold negative numbers:

```c
uint8_t u = 200;           /* bits: 11001000 */
int8_t s = (int8_t)u;
printf("%d\n", s);         /* prints -56 on typical compilers */
```

No bit changes here. Only the meaning does. In `int8_t`, a leftmost bit of 1 means "negative", which is the two's complement rule from [Why the machine matters](topic:why-low-level). So the same pattern now means $200 - 256 = -56$.

For a value that does not fit, the C rules leave this result to each compiler. Common compilers such as `gcc` and `clang` keep the bits, as shown here.

The other direction is fixed by the C rules: `(uint8_t)-1` is always 255.

## A cast does not check anything

Those examples all lead to the same point. A cast stops the compiler from complaining, but it never checks that the value fits. If the value might not fit, check it yourself first:

```c
if (a < 0 || a > 255) {
    printf("does not fit in one byte\n");
    return 1;
}
uint8_t b = (uint8_t)a;
```

Implicit conversions can lose data in the same way: `uint8_t b = a;` also cuts the number. Plain `-Wall -Wextra` does not warn about that line. The extra `gcc` option `-Wconversion` does.

:::trap
Thinking a cast rounds a number or stops it at the largest value. `(int)3.9` is 3, not 4, and `(uint8_t)300` is 44, not 255.
:::

## Practice

:::problem id=prac-cast-division title="Division and casts" source="ps2.pdf" kind=exercise solution_origin=derived
A class has `int passed = 3, students = 4;`.

:::check id=prac-cast-division-q1
`double rate = passed / students;` stores {{=0.0|0.75|1.0}}.

Both sides of `/` are `int`s, so the division gives 0, with the fraction thrown away. Only then does the 0 become 0.0.
:::

:::check id=prac-cast-division-q2
`double rate = (double)passed / students;` stores {{=0.75|0.0|1.0}}.

The cast runs first, so `/` has a `double` on one side and keeps the fraction.
:::

:::check id=prac-cast-division-q3
`int r = (int)(1.9 + 1.9);` stores {{=3|2|4}}.

The sum is 3.8. The cast drops the fraction without rounding, so the result is 3.
:::
:::

:::problem id=prac-cast-bits title="What is left after a cast" source="ps2.pdf" kind=exercise solution_origin=derived
Use a typical compiler such as `gcc`.

:::check id=prac-cast-bits-q1
`(uint8_t)511` is {{=255|0|511}}.

511 is $256 + 255$. The last byte is all ones, which is 255.
:::

:::check id=prac-cast-bits-q2
`(int8_t)(uint8_t)255` is {{=-1|255|127}}.

The byte is `11111111`. As `int8_t` the leftmost 1 means negative, and $255 - 256 = -1$.
:::

:::check id=prac-cast-bits-q3
`int8_t s = (int8_t)100;` stores {{=100|-156|-100}}.

100 fits in an `int8_t`, so nothing changes. A cast only changes a number that does not fit.
:::
:::

**Next:** [Pointers to pointers](topic:pointers-to-pointers) starts the main topic of Lecture 2, managing memory yourself, with a short recap of pointers.
