# 12 — A growing stack

This final lesson combines everything: a struct (lesson 10) that owns a heap block (lesson 11), passed by pointer (lesson 07), and grown with `malloc` and `free` (lesson 08). You will build a **stack** of `int`s that grows as you add values.

## What a stack is

A **stack** is a list where you only add and remove at one end, the top, like a stack of plates. The last value you put on is the first one you take off.

- **push** puts a value on top.
- **pop** removes the top value and gives it back.
- **top** looks at the top value without removing it.

Push 10, 20, 30, and then pop three times: you get 30, 20, 10.

## The struct

```c
struct int_stack {
    int* data;      /* heap block that holds the values */
    int length;     /* how many values are on the stack */
    int capacity;   /* how many ints the block has room for */
};
```

`length` and `capacity` are different numbers. The block usually has more room than the stack is using:

```text
length 3, capacity 4
data --> [10][20][30][  ]
```

The empty slot is room the stack already owns but is not using yet. It is not a value on the stack. The top value is always at index `length - 1`.

## Starting empty

A fresh stack has no block at all: `data` is null, and `length` and `capacity` are both 0. `stack_init` sets those three fields.

## Push and growth

When there is room (`length < capacity`), `push` writes the value at index `length` and adds one to `length`.

When the block is full (`length == capacity`), `push` must first make room:

1. Pick the new capacity: 4 if the stack has no block yet, otherwise twice the old capacity.
2. `malloc` a new block of that many ints.
3. Copy the `length` existing values into the new block.
4. `free` the old block. Do this after the copy, not before, or you would copy from memory that is no longer yours.
5. Point `data` at the new block and update `capacity`.

Then write the value as usual.

Step 1 can be written in one line:

```c
int next = s->capacity == 0 ? 4 : s->capacity * 2;
```

`condition ? a : b` is the **conditional operator**. It gives `a` when the condition is true and `b` when it is false. This line is a short form of:

```c
int next;
if (s->capacity == 0) {
    next = 4;
} else {
    next = s->capacity * 2;
}
```

Follow 5 pushes: the first push allocates room for 4. Pushes 2 to 4 fit. The fifth finds the block full and grows it to 8.

Why double instead of adding one slot each time? Every growth copies all the values. Doubling makes growth rare, so on average each push stays fast. The C++ `vector` and the Python `list` grow in a similar way.

If `malloc` fails, `push` returns without changing the stack.

## Pop, top, and free

- `pop` subtracts one from `length` and returns the value at the new `length`, which was the top. It does not shrink or free the block. The slot stays, so a later `push` reuses it.
- `top` returns the value at `length - 1` and leaves `length` alone.
- Calling `pop` or `top` on an empty stack would read index `-1`, which is undefined behavior. The caller must not do it.
- `stack_free` frees the block and sets the three fields back to an empty stack. Call it once when you are done with the stack.

## What the demo prints

```text
length = 3
capacity = 4
pop = 30
pop = 20
pop = 10
length after pops = 0
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. The tests build stacks, use them, and call `stack_free`. Then:

```bash
make try LESSON=12-capstone
make leaks LESSON=12-capstone
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

## What this path left out

This path stops at the C that the rest of the course assumes. It does not teach:

- unions, bitfields, function pointers, or macros beyond the include guard;
- files, system calls, and the rest of the Linux interface: that is course chapter 4, C and the Linux Operating System;
- how to measure a program's speed, how the processor's cache behaves, or how to write parallel code with OpenMP or CUDA: those are course chapters 5 to 10.

Those chapters build on the pointers, structs, and `malloc` you now know.
