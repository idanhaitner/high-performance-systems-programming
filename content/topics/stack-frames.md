---
id: stack-frames
title: How function calls use the stack
sources:
  - "ps2.pdf"
---

You have used functions and local variables since Lecture 1, but where do those variables actually live? This lesson follows a small program line by line and watches memory as functions start and end. It explains why a local variable disappears, and why some jobs need another kind of memory. That other kind is the subject of the next lesson.

## A pile of plates

Picture a pile of plates. You put a new plate on top, and you take the top plate off first. The plate you added last is the first one to leave. This rule is called **last in, first out**.

The **stack** is the area of memory that works this way. Function calls follow the same rule: the function that started last is the first to finish.

Each running function gets its own "plate", called a **stack frame**. When a function is called, a new frame goes on top. When it returns, that frame is removed automatically.

:::definition id=def-stack-frame title="Stack frame" source="ps2.pdf"
A stack frame is the piece of stack memory that belongs to one call of a function. It holds the function's parameters, its local variables, and its return address, which says where the program continues when the function ends.
:::

Two more details:

- **The stack pointer.** The processor has a tiny storage spot, called a **register**, that always holds the address of the top of the stack. This register is the **stack pointer**. Making a frame mostly means changing this one number, which is why it is so fast.
- **The stack grows down.** On typical machines, each new frame sits at a lower address than the one before it. The top of the pile is the lowest address.

## Following a program, line by line

Here is the program:

```c
#include <stdio.h>

int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int twice(int x) {
    int y = add(x, x);
    return y;
}

int main(void) {
    int n = 3;
    int result = twice(n);
    printf("%d\n", result);
    return 0;
}
```

Now the frames at each step. Each column is one frame. A `?` means the variable exists but has no value yet, and a dash means that frame is not on the stack.

| What just ran | Frame of `main` | Frame of `twice` | Frame of `add` |
| --- | --- | --- | --- |
| `int n = 3;` | n = 3, result = ? | - | - |
| `twice(n)` is called | n = 3, result = ? | x = 3, y = ? | - |
| `add(x, x)` is called | n = 3, result = ? | x = 3, y = ? | a = 3, b = 3, sum = ? |
| `int sum = a + b;` | n = 3, result = ? | x = 3, y = ? | a = 3, b = 3, sum = 6 |
| `add` returns 6 | n = 3, result = ? | x = 3, y = 6 | - |
| `twice` returns 6 | n = 3, result = 6 | - | - |

Here is the stack at its fullest moment, while `add` is running:

![Three frames piled up. main is at the highest addresses, twice is under it, and add is at the lowest addresses, where the stack pointer points.](../assets/figures/stack-frames.svg)

Look at what this shows:

- `x` and `a` are separate variables, each in its own frame. The call copies the value 3 into them.
- `return sum;` copies the value 6 out, and then the whole `add` frame goes away. `a`, `b`, and `sum` no longer exist.
- Each frame stores a return address. It is how `add` knows to continue inside `twice`, and how `twice` knows to continue inside `main`.

This is the simple picture. With optimization turned on, a compiler may keep some values in registers instead of on the stack, but the rule about when a variable exists stays the same.

:::check id=chk-deepest-frame
```c
int add(int a, int b) { return a + b; }
int twice(int x) { return add(x, x); }
int main(void) { return twice(3); }
```

While `add` runs, how many frames are on the stack?

- [x] 3
- [ ] 2
- [ ] 1

`main` called `twice`, and `twice` called `add`. None of them has finished, so all three frames are there. `add` is on top.
:::

## Why not make an array the size of the input?

Here is a natural idea: ask the user how many grades there are, then make a local array of that size.

```c
int n;
printf("How many grades? ");
scanf("%d", &n);
if (n <= 0)
    return 1;

int grades[n];
grades[0] = 90;
grades[n - 1] = 100;
```

An array whose length is decided while the program runs is called a **variable-length array**. `gcc` accepts it, but it is optional in current C, and some compilers do not support it.

Is it safe? It depends on what the user types:

- For `n = 5`, it needs 20 bytes and usually works.
- For `n = 100000000`, it needs 400 MB. The stack is usually limited to about 8 MB, so the program is likely to crash with a **stack overflow**.

Worse, the program has no way to find out first. It cannot ask "is there room?" before making the array.

## Why not return the address of a local variable?

What is wrong with this program?

```c
int *make_numbers(void) {
    int values[3] = {10, 20, 30};
    return values;
}

int main(void) {
    int *p = make_numbers();
    printf("%d\n", p[0]);
    return 0;
}
```

While `make_numbers` runs, everything is fine. `values` lives in its frame, and the three numbers are there.

Then the function returns and its frame is removed. `p` still holds the old address, but the array no longer exists. `p` is a **dangling pointer**: it holds the address of memory that is no longer yours.

Using `p[0]` is **undefined behavior**, which means the C rules do not say what happens. It might print 10, it might print garbage, or it might crash. Printing 10 proves nothing, because the old bytes may simply still be there. Most compilers warn about this code, so read your warnings.

:::check id=chk-local-address
```c
int *make(void) {
    int x = 5;
    return &x;
}
```

A program runs `int *p = make();` and then `printf("%d", *p);`. It prints 5. What does that prove?

- [x] Nothing: the code is still wrong, and the 5 was just left over
- [ ] The code is correct on this machine
- [ ] `x` was moved somewhere safe when `make` returned

`x` stopped existing when `make` returned. The bytes may stay untouched for a moment, so the program can look fine today and fail on the next run or with another compiler.
:::

### A safe direction: passing an address down

The opposite direction is fine. If `main` has an array and passes its address to a function, the array stays alive for the whole call, because the frame of `main` is still there:

```c
void fill(int *out) {
    out[0] = 10;
    out[1] = 20;
}

int main(void) {
    int values[2];
    fill(values);   /* fine: values lives in the frame of main */
    return 0;
}
```

The rule: a function may use the memory of the functions **below it in the pile**, because they have not finished. It must never hand out the address of its own locals to whoever called it.

## Three limits of the stack

So the stack is fast and automatic, but it has three limits:

| Limit | What it means | What goes wrong |
| --- | --- | --- |
| Small size | The operating system sets the limit, usually a few MB | A huge array or very deep calls cause a stack overflow |
| Fixed lifetime | A local variable dies when its function returns | Returning its address gives a dangling pointer |
| No flexibility | A local array cannot grow after it is made | Some data has an unknown size, like a list that gains an item each time new input arrives |

:::trap
Thinking a local variable is still usable "because the program printed the right value once". With undefined behavior, a correct-looking result is not evidence.
:::

## Practice

:::problem id=prac-frame-trace title="Reading the stack" source="ps2.pdf" kind=exercise solution_origin=source
Use this program:

```c
int add(int a, int b) {
    int sum = a + b;
    return sum;
}

int twice(int x) {
    int y = add(x, x);
    return y;
}

int main(void) {
    int n = 4;
    int result = twice(n);
    return 0;
}
```

:::check id=prac-frame-trace-q1
While `add` is running, the value of `y` is {{=not set yet|8|4}}.

`y` gets its value only after `add` returns, so at this moment it is unknown.
:::

:::check id=prac-frame-trace-q2
Right after `add` returns, which variable no longer exists? {{=sum|x|n}}

`sum` lived in the frame of `add`, and that frame is gone. `x` is in the frame of `twice`, and `n` is in the frame of `main`. Both are still running.
:::

:::check id=prac-frame-trace-q3
A frame is removed {{=when its function returns|when the program ends|when you call free}}.

Stack memory is managed automatically. `free` is only for memory from `malloc`.
:::
:::

:::problem id=prac-stack-limits title="Is this safe on the stack?" source="ps2.pdf" kind=exercise solution_origin=derived
Assume a 4-byte `int` and a stack limit of 8 MB.

:::check id=prac-stack-limits-q1
`int a[n];` with `n` equal to 3,000,000 needs {{=12 MB, so it is likely to crash|12 KB, so it is fine|3 MB, so it is fine}}.

3,000,000 times 4 bytes is 12,000,000 bytes, about 12 MB, which is more than the limit.
:::

:::check id=prac-stack-limits-q2
A function has a local `int a[4];` and calls `sum(a, 4)`. Inside `sum`, reading `a` through the pointer it received is {{=safe, because the caller's frame is still there|undefined behavior, because a is a local variable|safe only if a came from malloc}}.

The array lives until the function that made it returns, and that function is still waiting for `sum`.
:::
:::

**Next:** [Memory on request: malloc and free](topic:malloc-and-free) introduces the heap, which removes all three limits: you choose the size while the program runs, and the memory stays until you give it back.
