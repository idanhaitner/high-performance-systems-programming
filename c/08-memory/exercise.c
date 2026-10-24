// Lesson 8 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=08-memory
// A finished version is in solution.c. Try before you open it.

#include "check.h"

#include <stdlib.h>

int* box_int(int value) {
    // Allocate one int, store value in it, and return the pointer.
    // Return null if allocation fails.
    int* p = malloc(sizeof(int));
    if (p == 0) {
        return 0;
    }
    *p = value;
    return p;
}

void free_box(int* p) {
    // Release the int from box_int. p may be null.
    free(p);
}

int* fill_range(int n) {
    // Allocate n ints and store 0, 1, ..., n - 1.
    // n ints need (size_t)n * sizeof(int) bytes.
    // When n is 0, return null and allocate nothing.
    // Return null if allocation fails.
    if (n == 0) {
        return 0;
    }
    // n ints need n * sizeof(int) bytes.
    int* p = malloc((size_t)n * sizeof(int));
    if (p == 0) {
        return 0;
    }
    for (int i = 0; i < n; i = i + 1) {
        p[i] = i;
    }
    return p;
}

void release_range(int* p) {
    // Release the array from fill_range. p may be null.
    free(p);
}

int sum_range(int n) {
    // Return 0 + 1 + ... + (n - 1). When n is 0, return 0.
    // Practice: build the numbers with fill_range, add them up, then
    // release the block with release_range before returning.
    int* p = fill_range(n);
    if (p == 0) {
        return 0;
    }
    int sum = 0;
    for (int i = 0; i < n; i = i + 1) {
        sum = sum + p[i];
    }
    release_range(p);
    return sum;
}

static void test_box(void) {
    int* p = box_int(42);
    expect_true(p != 0, "box_int returned null");
    expect_int(*p, 42);
    free_box(p);
}

static void test_box_zero(void) {
    int* p = box_int(0);
    expect_true(p != 0, "box_int returned null");
    expect_int(*p, 0);
    free_box(p);
}

static void test_free_null(void) {
    free_box(0);
}

static void test_range(void) {
    int* p = fill_range(4);
    expect_true(p != 0, "fill_range returned null");
    expect_int(p[0], 0);
    expect_int(p[1], 1);
    expect_int(p[2], 2);
    expect_int(p[3], 3);
    release_range(p);
}

static void test_range_empty(void) {
    expect_true(fill_range(0) == 0, "fill_range(0) allocated");
}

static void test_sum(void) {
    expect_int(sum_range(5), 10);
}

static void test_sum_empty(void) {
    expect_int(sum_range(0), 0);
}

int main(void) {
    Score score = {0};
    task(&score, "box_int(42) stores 42", test_box);
    task(&score, "box_int(0) stores 0", test_box_zero);
    task(&score, "free_box(null) is safe", test_free_null);
    task(&score, "fill_range(4) is 0, 1, 2, 3", test_range);
    task(&score, "fill_range(0) is null", test_range_empty);
    task(&score, "sum_range(5) is 10", test_sum);
    task(&score, "sum_range(0) is 0", test_sum_empty);
    return score_finish(&score);
}
