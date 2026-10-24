// Lesson 11 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=11-ownership
// A finished version is in solution.c. Try before you open it.

#include "check.h"

#include <stdlib.h>

struct buffer {
    int* data;
    int length;
};

struct buffer make_buffer(const int* src, int n) {
    // Return a buffer that owns a fresh copy of the n ints at src.
    // Allocate a new block with malloc, then copy each int into it.
    // When n is 0, data is null and length is 0.
    // When allocation fails, data is null and length is 0.
    struct buffer b;
    if (n == 0) {
        b.data = 0;
        b.length = 0;
        return b;
    }
    b.data = malloc((size_t)n * sizeof(int));
    if (b.data == 0) {
        b.length = 0;
        return b;
    }
    b.length = n;
    for (int i = 0; i < n; i = i + 1) {
        b.data[i] = src[i];
    }
    return b;
}

struct buffer copy_buffer(struct buffer src) {
    // Return a buffer that owns its own copy of src's ints.
    // An empty src produces an empty buffer.
    // Returning src itself is the shallow copy bug. Hint: make_buffer
    // already copies ints into a new block.
    return make_buffer(src.data, src.length);
}

void free_buffer(struct buffer* b) {
    // Release b's ints, then set data to null and length to 0.
    // b is not null. An empty buffer is safe to free.
    free(b->data);
    b->data = 0;
    b->length = 0;
}

int buffer_at(struct buffer b, int i) {
    // Return element i. i is inside the buffer.
    return b.data[i];
}

static void test_copies_values(void) {
    int src[3] = {1, 2, 3};
    struct buffer a = make_buffer(src, 3);
    expect_true(a.data != 0, "make_buffer returned no storage");
    expect_true(a.data != src, "make_buffer aliased the caller");
    expect_int(a.data[0], 1);
    expect_int(a.length, 3);
    free_buffer(&a);
}

static void test_empty(void) {
    struct buffer a = make_buffer(0, 0);
    expect_true(a.data == 0, "empty buffer has storage");
    expect_int(a.length, 0);
    free_buffer(&a);
}

static void test_independent(void) {
    int src[3] = {1, 2, 3};
    struct buffer a = make_buffer(src, 3);
    struct buffer b = copy_buffer(a);
    expect_true(a.data != 0 && b.data != 0, "a copy is missing storage");
    expect_true(a.data != b.data, "the copy uses its own buffer");
    a.data[0] = 9;
    expect_int(b.data[0], 1);
    free_buffer(&a);
    free_buffer(&b);
}

static void test_copy_length(void) {
    int src[2] = {4, 5};
    struct buffer a = make_buffer(src, 2);
    struct buffer b = copy_buffer(a);
    expect_int(b.length, 2);
    expect_int(buffer_at(b, 1), 5);
    free_buffer(&a);
    free_buffer(&b);
}

static void test_copy_empty(void) {
    struct buffer a = make_buffer(0, 0);
    struct buffer b = copy_buffer(a);
    expect_true(b.data == 0, "empty copy has storage");
    expect_int(b.length, 0);
    free_buffer(&a);
    free_buffer(&b);
}

static void test_free_clears(void) {
    int src[1] = {4};
    struct buffer a = make_buffer(src, 1);
    free_buffer(&a);
    expect_true(a.data == 0, "free left the pointer set");
    expect_int(a.length, 0);
}

int main(void) {
    Score score = {0};
    task(&score, "make_buffer copies into new storage", test_copies_values);
    task(&score, "make_buffer of nothing is empty", test_empty);
    task(&score, "copy_buffer does not share storage", test_independent);
    task(&score, "copy_buffer keeps the elements", test_copy_length);
    task(&score, "copy of an empty buffer is empty", test_copy_empty);
    task(&score, "free_buffer clears the struct", test_free_clears);
    return score_finish(&score);
}
