---
id: printf-and-scanf
title: Printing and reading values
sources:
  - "ps1 (1).pdf"
---

You have used `printf` to print and `scanf` to read since the first lessons. This lesson, based on the course's first practice session (tutorial), looks at both more closely. You will learn how to print the same number in different ways, why a negative number can print as a huge positive one, and why `scanf` sometimes seems to "skip" your input. That last one catches almost every beginner, so it gets its own section.

## The shape of every C program

Every program in this course has the same skeleton:

```c
#include <stdio.h>

int main(void) {
    printf("Hello, world!\n");
    return 0;
}
```

- `#include <stdio.h>` brings in the **declarations** (announcements of names and types) of the standard input and output functions, such as `printf` and `scanf`. Without it, the compiler does not know what `printf` is.
- `int main(void)` is where the program starts. `void` in the parentheses means it receives nothing.
- `printf(...)` writes text to the **standard output**, which is normally the terminal window.
- `return 0;` tells the operating system that the program finished successfully. Any other number means "something went wrong".

## Printing with printf

`printf` prints a piece of text, its **format string**, and replaces each **placeholder** in it with a value:

```c
int age = 23;
printf("Age: %d\n", age);   /* Age: 23 */
```

- `"Age: "` is printed exactly as written.
- `%d` is a placeholder (C calls it a **format specifier**). It says "put an `int` here, written in decimal".
- `\n` is the newline character: it moves to the next line.
- `age` is the value that goes into `%d`. The first value after the format string fills the first placeholder, the second value the second, and so on.

:::definition id=def-format-specifier title="Format specifier" source="ps1 (1).pdf"
A format specifier is a placeholder in a `printf` or `scanf` format string, starting with `%`. It says what type of value goes there and how to write it, for example `%d` for an `int` in decimal or `%.2f` for a decimal number with 2 digits after the point.
:::

The placeholders you will use most:

| Placeholder | Prints | Example output |
| --- | --- | --- |
| `%d` | an `int`, in decimal | `42` |
| `%u` | an `unsigned int` (never negative) | `42` |
| `%x` / `%X` | an `unsigned int` in hexadecimal, small or capital letters | `2a` / `2A` |
| `%o` | an `unsigned int` in octal (base 8) | `52` |
| `%f` | a `float` or `double`, 6 digits after the point | `3.140000` |
| `%.2f` | the same, with 2 digits after the point | `3.14` |
| `%e` / `%E` | a decimal number in scientific notation | `3.140000e+00` |
| `%c` | one character | `A` |
| `%s` | a string (text that ends with `'\0'`) | `Hello` |
| `%p` | an address | `0x7ffd5c3a1b2c` |
| `%zu` | a `sizeof` result | `4` |

The placeholder must match the type of the value. If it does not, `printf` reads the bytes the wrong way, and the result is garbage or undefined behavior.

### One number, many ways

Here is what happens when you print the same negative `int` with different placeholders:

```c
int x = -246;
printf("Decimal: %d\n", x);   /* Decimal: -246 */
printf("Unsigned: %u\n", x);  /* Unsigned: 4294967050 */
printf("Hex: %X\n", x);       /* Hex: FFFFFF0A */
printf("hex: %x\n", x);       /* hex: ffffff0a */
printf("Octal: %o\n", x);     /* Octal: 37777777412 */
```

Why does `-246` print as `4294967050`? Remember from [Why the machine matters](topic:why-low-level) that an `int` is 32 bits, and a negative number is stored as a special bit pattern. `printf` does not see "minus 246"; it sees 32 bits. `%d` reads them as a signed number and prints -246. `%u` reads the **same bits** as an unsigned number, which gives $2^{32} - 246 = 4294967296 - 246 = 4294967050$. `%X` shows those bits in hex: `FFFFFF0A`.

(Strictly speaking, `%u`, `%x`, and `%o` expect an `unsigned int`. Passing a negative `int` works this way on every common machine, and the course shows it to make the bits visible.)

### Decimal numbers and precision

```c
float f = 251.733733733;
printf("%f\n", f);     /* 251.733734 */
printf("%.8f\n", f);   /* 251.73373413 */
printf("%.3f\n", f);   /* 251.734 */
printf("%e\n", f);     /* 2.517337e+02 */
```

- `%f` rounds to 6 digits after the point.
- `%.8f` asks for 8 digits, and shows `251.73373413`, not `251.73373373`. A `float` only keeps about 7 significant digits, so the stored number is already a little off. Asking for more digits just shows the error.
- `%.3f` rounds to 3 digits.
- `%e` writes the number as $2.517337 \times 10^2$: digits, then `e+02` for "times 10 to the power 2".

### Characters are numbers

A `char` holds a small number, the character's code. `%c` prints it as a character and `%d` as a number:

```c
const int caseDiff = 'A' - 'a';  /* -32: the distance from small to capital letters */
char c = 'a';
printf("%c %d\n", c, c);  /* a 97 */
c = c + 1;
printf("%c %d\n", c, c);  /* b 98 */
c = c + caseDiff;
printf("%c %d\n", c, c);  /* B 66 */
```

Notice `caseDiff`. We could have written `c = c - 32;`, but a reader would have to guess what 32 means. A number with no explanation like that is called a **magic number**. Giving it a name, and computing it from `'A' - 'a'`, makes the code explain itself. (`const` means the value can never change; the next section of [Values and types](topic:c-data-types) explains it.)

## Reading with scanf

`scanf` reads what the user types and stores it into your variables. Like `printf`, it takes a format string with placeholders:

```c
int age;
double grade;
scanf("%d %lf", &age, &grade);   /* the user types: 21 94.75 */
```

- `%d` reads a whole number into `age`. `%lf` reads a decimal number into `grade`.
- `&age` is the **address** of `age`. `scanf` must *change* your variable, so it needs to know where it lives (see [Memory and pointers](topic:memory-and-pointers)).
- The user may separate the two numbers with spaces or with Enter; both work.

| Placeholder | Reads into | Example input |
| --- | --- | --- |
| `%d` | an `int` | `42` |
| `%f` | a `float` | `3.14` |
| `%lf` | a `double` | `3.14159` |
| `%c` | one `char` | `A` |
| `%s` / `%19s` | a word, into a `char` array | `Hello` |

Three rules that cause most `scanf` bugs:

1. **`%f` is for `float`, `%lf` is for `double`.** In `printf` both are printed with `%f`, but `scanf` must know how many bytes to write, so a `double` needs `%lf`.
2. **Use `&` for ordinary variables, but not for a `char` array.** The name of an array already stands for the address of its first element, so you write `scanf("%19s", name)`, without `&`.
3. **Limit how much `%s` may read.** For `char name[20];`, write `%19s`: at most 19 letters, which leaves room for the `'\0'` at the end. A plain `%s` keeps writing past the end of the array if the user types a long word.

:::trap
Reading a `double` with `%f`. `scanf("%f", &grade)` with `double grade` writes a 4-byte `float` into an 8-byte box, so `grade` ends up holding nonsense. Use `%lf` for `double` in `scanf`.
:::

## The input buffer: why scanf "skips" input

When `scanf` runs, the program stops and waits. You type some characters and press Enter. Everything you typed, **including the Enter**, goes into a waiting area called the **input buffer** (or **stdin**, "standard input"). `scanf` then takes characters out of that buffer, as many as its placeholders need. Whatever it does not need **stays in the buffer** for the next read.

:::definition id=def-stdin-buffer title="Input buffer (stdin)" source="ps1 (1).pdf"
The input buffer is where the characters you type wait until the program reads them. A read such as `scanf` takes only what it needs and leaves the rest there. The next read uses the leftover characters first, before waiting for new typing.
:::

### The leftover newline

Look at this program:

```c
int x;
char ch;
printf("Enter a number: ");
scanf("%d", &x);
printf("Enter a character: ");
scanf("%c", &ch);
printf("x = %d, ch = '%c'\n", x, ch);
```

You type `5` and press Enter. The buffer now holds two characters: `5` and a newline `\n`.

1. `scanf("%d", &x)` takes the `5` and stops at the newline, because a newline is not a digit. The newline **stays in the buffer**.
2. `scanf("%c", &ch)` asks for any one character. There is already one waiting, the newline, so it takes it **without waiting for you**.
3. The program prints `ch = '` and then a line break, and ends. You never got to type your character.

### Fix 1: a space before %c

```c
scanf(" %c", &ch);
```

A space in the format string means "skip any spaces, tabs, and newlines first". So `" %c"` skips the leftover newline and then waits for a real character. This is the simplest fix, and the one used in [Values and types](topic:c-data-types).

Most placeholders skip spaces and newlines by themselves: `%d`, `%f`, `%lf`, and `%s` all do. **Only `%c` does not**, because a space or a newline is a character too.

### Fix 2: empty the buffer

You can also throw away everything up to and including the next newline:

```c
while (getchar() != '\n')
    ;   /* empty loop body: just keep reading */
```

`getchar()` takes **one** character from the buffer and returns it. The loop keeps taking characters until it has taken a newline, so afterwards the buffer is empty and the next `scanf` waits for new typing.

One caution: if the input ends without a newline (for example, it comes from a file), `getchar()` returns a special value `EOF` ("end of file") forever, and this loop never stops. A safer version also stops at `EOF`:

```c
int ch;
while ((ch = getchar()) != '\n' && ch != EOF)
    ;
```

:::trap
Reading a character right after a number with `scanf("%c", ...)`. It picks up the newline left over from pressing Enter. Write `" %c"` with a space, or empty the buffer first.
:::

## Practice

:::problem id=prac-print-negative title="One number, three placeholders" source="ps1 (1).pdf" kind=exercise solution_origin=source
On a machine with a 32-bit `int`, `int x = -2;`. Its 32 bits are all 1s except the last one.

:::check id=prac-print-negative-q1
`printf("%u", x)` prints {{=4294967294|-2|2}}.

`%u` reads the bits as a number with no sign. All 1s is $2^{32} - 1 = 4294967295$, and the last bit being 0 makes it one less.
:::

:::check id=prac-print-negative-q2
`printf("%X", x)` prints {{=FFFFFFFE|FFFFFFFF|-2}}.

Each hex digit is 4 bits. The first seven groups are `1111`, which is `F`. The last group is `1110`, which is `E`.
:::

:::check id=prac-print-negative-q3
After `unsigned int u = x;`, the line `printf("%d", u)` prints {{=-2|4294967294|2}}.

Storing `x` in `u` keeps the same bits. `%d` reads whatever bits it receives as a signed number, so the type of the variable no longer matters.
:::
:::

:::problem id=prac-float-digits title="How many digits a float keeps" source="ps1 (1).pdf" kind=exercise solution_origin=source
```c
float f = 251.733733733;
```

:::check id=prac-float-digits-q1
`printf("%.0f", f)` prints {{=252|251|251.7}}.

`%.0f` keeps no digits after the point and rounds. 251.73 is closer to 252. Only an `int` conversion would chop it to 251.
:::

:::check id=prac-float-digits-q2
Why does `printf("%.8f", f)` print `251.73373413` instead of `251.73373373`?

- [x] A `float` keeps only about 7 significant digits, so the stored value is already slightly different
- [ ] `printf` turns the `float` into a `double`, and that step adds the error
- [ ] `%.8f` keeps the digits you typed and only rounds the last few up

The value was rounded when it was stored in the `float`. Moving it to a `double` keeps that value exactly, and asking for more digits only reveals the rounding.
:::
:::

:::problem id=prac-leftover-newline title="The character that was never typed" source="ps1 (1).pdf" kind=exercise solution_origin=source
```c
int x;
char ch;
scanf("%d", &x);
scanf("%c", &ch);
```

:::check id=prac-leftover-newline-q1
The user types `7 x` and presses Enter. After both lines, `ch` holds {{=a space|x|a newline character}}.

`%d` takes the `7` and stops. `%c` takes the very next character, whatever it is, and that is the space.
:::

:::check id=prac-leftover-newline-q2
Which change makes the second line wait for a real character?

- [x] `scanf(" %c", &ch);`
- [ ] `scanf("%c ", &ch);`
- [ ] `scanf("%d", &ch);`

A space **before** `%c` skips spaces and newlines before reading. A space after it only skips what comes next. `%d` would read a number, not a character.
:::
:::

:::problem id=prac-scanf-placeholders title="Choosing scanf placeholders" source="ps1 (1).pdf" kind=exercise solution_origin=derived
Given `int n; double price; char word[10];`:

:::check id=prac-scanf-placeholders-q1
Which pair reads and then prints `price` correctly?

- [x] `scanf("%lf", &price); printf("%f", price);`
- [ ] `scanf("%f", &price); printf("%f", price);`
- [ ] `scanf("%lf", price); printf("%f", &price);`

`scanf` writes into your variable, so it must know the exact size: `%lf` for a `double`. `printf` receives a copy of the value, and `%f` is right for a `double` there. Only `scanf` gets the `&`.
:::

:::check id=prac-scanf-placeholders-q2
To read one word into `word` safely, the call is {{=scanf("%9s", word)|scanf("%s", &word)|scanf("%10s", word)}}.

The array name is already an address, so no `&`. With room for 10 characters, read at most 9 and leave one for the `'\0'`.
:::
:::

**Next:** [Working with strings](topic:strings) looks inside text: how C stores it, and the library functions that measure, copy, compare, and split it.
