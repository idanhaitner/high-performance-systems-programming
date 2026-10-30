---
id: lecture-1
lecture: lecture-1
title: "Lecture 1 practice: data, memory, and running programs"
---

:::learn title="How this practice works"
You have read the lessons, so now you use them. Each lesson gets one new question, then a very small code question where you write just a few lines, then a bigger coding exercise. One lab, done on your own computer in VS Code (a free code editor), comes last. It ends with a final exercise that uses everything from these lessons.

Press **Next** when a step is done. If you are stuck, press **Skip for now**, or use the **Reread** link at the top of the step to open that step's lesson.

A coding exercise gives you the function's first line, and the task above the editor says what it must do. You write the rest. **Format** tidies your code, and it also runs by itself when you press Run or Test. **Run** shows what your code prints. **Test my code** checks it against small test cases, and all of them must pass. **Show assembly** shows the machine instructions the compiler made; it is there if you are curious. If you get stuck, **Show hint** opens one hint at a time, and **Show solution** shows a finished answer. Try the exercise first, because you learn more that way.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press one of these buttons.
:::

:::check id=q-lost-one lesson=why-low-level
A `double` keeps only about 16 significant digits. What does this print?

```c
double total = 1e20;
total = total + 1.0;
total = total - 1e20;
printf("%.1f\n", total);
```

- [ ] `1.0`
- [x] `0.0`
- [ ] `100000000000000000000.0`

The 1.0 is far too small for a number as big as 1e20 to remember, so the first addition changes nothing. Subtracting 1e20 then leaves exactly 0.
:::

:::exercise ref=ex-sum-row lesson=why-low-level
:::

:::exercise ref=ex-sum-squares lesson=why-low-level
:::

:::check id=q-two-divisions-together lesson=c-data-types
What does this print?

```c
int a = 10;
double b = a / 4;
double c = a / 4.0;
printf("%.1f %.1f\n", b, c);
```

- [x] `2.0 2.5`
- [ ] `2.5 2.5`
- [ ] `2.0 2.0`

In `a / 4` both sides are whole numbers, so the division throws away the fraction and gives 2. Storing that in a `double` is too late to bring the fraction back. In `a / 4.0` one side is a `double`, so the fraction is kept.
:::

:::exercise ref=ex-digit-value lesson=c-data-types
:::

:::exercise ref=ex-average lesson=c-data-types
:::

:::check id=q-pointer-walks lesson=memory-and-pointers
What does this print?

```c
int a[3] = {5, 6, 7};
int *p = a;
*p = 9;
p = p + 2;
printf("%d %d\n", a[0], *p);
```

- [ ] `5 7`
- [x] `9 7`
- [ ] `9 6`

`p` starts at `a[0]`, so `*p = 9` changes `a[0]`. Then `p + 2` moves the pointer two `int`s along, to `a[2]`, which holds 7. Moving the pointer does not change the array.
:::

:::exercise ref=ex-set-to-zero lesson=memory-and-pointers
:::

:::exercise ref=ex-swap lesson=memory-and-pointers
:::

:::check id=q-one-number-three-ways lesson=printf-and-scanf
What does this print? Remember that the letter `A` has the number 65.

```c
int n = 65;
printf("%d %c %X\n", n, n, n);
```

- [x] `65 A 41`
- [ ] `65 65 65`
- [ ] `A A A`

All three placeholders get the same number and show it in different ways. `%d` shows it as a decimal number, `%c` as the letter with that number, and `%X` in hexadecimal (base 16), where 65 is 41.
:::

:::exercise ref=ex-print-price lesson=printf-and-scanf
:::

:::exercise ref=ex-number-then-letter lesson=printf-and-scanf
:::

:::check id=q-early-end lesson=strings
After these two lines, what does `printf("%s", word)` print, and what is `strlen(word)`?

```c
char word[] = "hello";
word[2] = '\0';
```

- [ ] It prints `hello`, and `strlen(word)` is 5
- [ ] It prints `he`, and `strlen(word)` is 5
- [x] It prints `he`, and `strlen(word)` is 2

A string ends at its first `'\0'`, wherever that is. Both `printf` and `strlen` stop there. The letters after it are still in the array, but string tools never reach them.
:::

:::exercise ref=ex-count-letter lesson=strings
:::

:::exercise ref=ex-compare-text lesson=strings
:::

:::check id=q-copied-point lesson=structures
What does this print?

```c
struct Point { int x; int y; };

struct Point pts[2] = {{1, 2}, {3, 4}};
struct Point p = pts[0];
p.x = 9;
pts[1].y = p.x + pts[0].x;
printf("%d\n", pts[1].y);
```

- [ ] `18`
- [x] `10`
- [ ] `5`

`p = pts[0]` makes a separate copy, so `p.x = 9` leaves `pts[0].x` at 1. The sum is 9 + 1, which is 10.
:::

:::exercise ref=ex-move-point lesson=structures
:::

:::exercise ref=ex-best-student lesson=structures
:::

:::check id=q-undefined-reference lesson=source-to-process
Your `main.c` calls `area`, and the code of `area` is in `shapes.c`. You build with `gcc main.c -o app`, and it stops with an "undefined reference to `area`" error. Which step failed, and what is the fix?

- [ ] The preprocessor could not find `area`. Add a `#define` for it
- [ ] The program crashed while running. Run it again with a larger stack
- [x] The linker could not find the code of `area`. Add `shapes.c` to the command

The linker's job is to connect each call to the code it calls. Nobody gave it `shapes.c`, so the call to `area` had nothing to connect to.
:::

:::exercise ref=ex-global-counter lesson=source-to-process
:::

:::exercise ref=ex-next-ticket lesson=source-to-process
:::

:::check id=q-bad-word lesson=command-line-arguments
This program prints `atoi(argv[1]) + atoi(argv[2])`. You run it as `./add 5 abc`. What does it print?

- [ ] An error message, and then it stops
- [x] `5`
- [ ] `0`

`atoi` cannot report bad input. `atoi("abc")` just returns 0, so the sum is 5 + 0. The program gives a wrong-looking answer and no warning.
:::

:::exercise ref=ex-count-args lesson=command-line-arguments
:::

:::exercise ref=ex-sum-args lesson=command-line-arguments
:::

:::lab ref=lab-stride-timing lesson=why-low-level
:::
