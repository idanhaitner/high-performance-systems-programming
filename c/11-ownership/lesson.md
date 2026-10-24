# 11 — Ownership

Lesson 08 said every `malloc` needs exactly one `free`. Lesson 10 said assigning a struct copies it. Put the two together and a new problem appears: when a struct holds a pointer to heap memory, copying the struct copies the **pointer**, not the memory. This lesson shows how to copy such a struct correctly, and introduces the idea of **ownership**: who is responsible for calling `free`.

## A struct that holds heap memory

```c
struct buffer {
    int* data;    /* address of a heap block of ints */
    int length;   /* how many ints are in that block */
};
```

The struct itself is small: one pointer and one `int`. The ints live in a separate heap block, and `data` points at it.

We say the buffer **owns** that block. Owning a block means: this is the one place responsible for calling `free` on it, exactly once, when it is no longer needed.

## The shallow copy bug

```c
/* Bug: a and b now point at the same block. */
struct buffer b = a;
```

Assigning the struct copies both fields. `b.data` gets the same address as `a.data`. Now two structs point at one block:

```text
a.data --\
          >--> [1][2][3]
b.data --/
```

This is called a **shallow copy**. Two things go wrong:

- Changing `a.data[0]` also changes `b.data[0]`, because it is the same memory.
- Each struct thinks it owns the block. When both are freed, the block is freed twice. That is a **double free**, which is undefined behavior.

## The fix: a deep copy

A **deep copy** allocates a new block and copies the ints into it. Then each struct owns its own block:

```text
src          [1][2][3]     the caller's array, not owned by any buffer
a.data  -->  [1][2][3]     a's own block
b.data  -->  [1][2][3]     b's own block
```

After `a.data[0] = 9`, `b` still starts with 1.

The exercise builds this in three functions:

- `make_buffer(src, n)` allocates a block of `n` ints, copies the `n` ints from `src` into it, and returns a `struct buffer` that points at it. Returning the struct copies only its two fields; the block is not copied again. Whoever receives the struct now owns the block.
- `copy_buffer(src)` makes a deep copy of an existing buffer. It must allocate a new block. Returning `src` itself would be the shallow copy bug. Notice that `make_buffer` already does exactly this work.
- `free_buffer(&b)` releases the block.

An empty buffer has `data` set to null and `length` set to 0. Copying an empty buffer allocates nothing.

## Freeing safely

```c
void free_buffer(struct buffer* b) {
    free(b->data);
    b->data = 0;
    b->length = 0;
}
```

`free_buffer` takes a pointer, so it can change the caller's struct. After freeing the block, it sets `data` to null. If `free_buffer` is then called a second time by mistake, it calls `free(0)`, which does nothing. Without that line, the second call would be a double free.

Forgetting to call `free_buffer` at all leaks the block. `make leaks LESSON=11-ownership` reports that.

## What the demo prints

```text
original now starts with 9
copy still starts with 1
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. If `copy_buffer` shares the caller's block, the tests report a `[fail]` and stop before they would free that block twice. Then:

```bash
make try LESSON=11-ownership
make leaks LESSON=11-ownership
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [a growing stack](../12-capstone/lesson.md), the final project of this path.
