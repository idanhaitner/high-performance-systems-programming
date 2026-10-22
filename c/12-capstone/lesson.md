# 12 — A growing stack

A stack of ints is the ownership lesson with a length that changes. The struct owns one buffer. `push` appends. `pop` removes the last value. When the buffer is full, you allocate a larger one, copy the old ints, and `free` the old buffer.

```text
length 3, capacity 4
data --> [10][20][30][ ]
```

The empty slot is capacity you already own. It is not a value on the stack. `length` is the number of values. `capacity` is how many ints the buffer can hold.

## Growth

A fresh stack has `data == 0`, `length == 0`, and `capacity == 0`. The first `push` allocates 4 ints. While `length < capacity`, `push` writes at index `length` and then adds one to `length`.

When `length == capacity` and `capacity` is already positive, the next buffer has twice as many ints. Five values need a second growth: 4 is full after the fourth push, and the fifth allocates 8. Copy the live values, not the whole old capacity's garbage. `free` the old buffer after the copy, not before.

```c
int next = s->capacity == 0 ? 4 : s->capacity * 2;
```

`pop` subtracts one from `length` and returns the int that was at the new `length`. It does not `free` the buffer. The capacity stays, so a later `push` can reuse the slot. `top` reads the last value and leaves `length` alone.

`stack_free` releases the buffer and sets the three fields back to an empty stack. Call it once when the stack is finished. `make test-asan` fails a solution that leaks the buffer.

## What this path left out

This path stops at the C the rest of the course assumes.

It does not teach bitfields, unions, function pointers, or macros beyond the include guard. You will not need them to write the early programs.

It does not teach files, system calls, or the rest of the Linux interface. That is course chapter 4, C and the Linux Operating System.

It does not teach how to measure a program, how a cache behaves, or how to write OpenMP or CUDA. Those are course chapters 5 through 10. They use the pointers, the structs, and the `malloc` you have now.

## What the demo prints

```text
size = 3
capacity = 4
pop = 30
pop = 20
pop = 10
size after pops = 0
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. The tests build stacks, use them, and call `stack_free`. Then:

```bash
make try LESSON=12-capstone
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.
