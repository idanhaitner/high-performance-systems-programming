# 11 — Ownership

A struct that holds a pointer from `malloc` owns that block. Copying the struct copies the pointer, not the ints. Two owners of one block will both call `free`. The second `free` is **undefined behavior**.

```text
src          [1][2][3]     the caller's array, not owned
a.data  -->  [1][2][3]     a's own block
b.data  -->  [1][2][3]     b's own block
```

After `a.data[0] = 9`, `b` still starts with 1, because the copy has its own block.

## A deep copy

```c
struct buffer {
    int* data;
    int length;
};
```

`make_buffer` allocates `n * sizeof(int)` bytes, copies each element, and returns the struct by value. The returned struct is a copy of the two fields. The block they point at is not copied again by that return. The caller of `make_buffer` owns the block and must `free` it.

`copy_buffer` does the same work from an existing buffer. It allocates a new block. It does not return `src` unchanged. An empty buffer has `data == 0` and `length == 0`. Copying it allocates nothing.

```c
void free_buffer(struct buffer* b) {
    free(b->data);
    b->data = 0;
    b->length = 0;
}
```

Setting the pointer to null after `free` makes a second `free_buffer` safe, because `free(0)` does nothing. Forgetting the `free` leaks the block. `make test-asan` reports that leak.

A shallow copy is the bug this lesson is about:

```c
/* Do not do this. a and b own one block. */
struct buffer b = a;
```

## What the demo prints

```text
original now starts with 9
copy still starts with 1
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. A copy that shares the caller's block fails the tests, and the tests stop before they would free that block twice. Then:

```bash
make try LESSON=11-ownership
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [a growing stack](../12-capstone/lesson.md).
