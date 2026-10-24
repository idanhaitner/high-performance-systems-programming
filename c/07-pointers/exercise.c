// Lesson 7 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=07-pointers
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int read_or(const int* p, int fallback) {
    // Return *p, or fallback when p is null.
    not_implemented("read_or");
}

void set_to(int* p, int value) {
    // Write value into the int p points at. p is not null.
    not_implemented("set_to");
}

void swap_ints(int* a, int* b) {
    // Exchange the ints a and b point at. Both pointers are not null.
    // Example: if *a is 1 and *b is 2, afterwards *a is 2 and *b is 1.
    not_implemented("swap_ints");
}

int nth(const int* a, int i) {
    // Return the element i positions past a. a is not null, and i is in range.
    not_implemented("nth");
}

static void test_read_null(void) {
    expect_int(read_or(0, 7), 7);
}

static void test_read_value(void) {
    int x = 4;
    expect_int(read_or(&x, 7), 4);
}

static void test_set_to(void) {
    int x = 0;
    set_to(&x, 9);
    expect_int(x, 9);
}

static void test_swap(void) {
    int a = 1;
    int b = 2;
    swap_ints(&a, &b);
    expect_int(a, 2);
    expect_int(b, 1);
}

static void test_swap_same(void) {
    int a = 5;
    int b = 5;
    swap_ints(&a, &b);
    expect_int(a, 5);
    expect_int(b, 5);
}

static void test_nth_middle(void) {
    int scores[3] = {10, 20, 30};
    expect_int(nth(scores, 2), 30);
}

static void test_nth_first(void) {
    int scores[3] = {10, 20, 30};
    expect_int(nth(scores, 0), 10);
}

int main(void) {
    Score score = {0};
    task(&score, "read_or(null, 7) is 7", test_read_null);
    task(&score, "read_or of 4 is 4", test_read_value);
    task(&score, "set_to writes 9", test_set_to);
    task(&score, "swap exchanges 1 and 2", test_swap);
    task(&score, "swap of 5 and 5 stays 5", test_swap_same);
    task(&score, "nth(scores, 2) is 30", test_nth_middle);
    task(&score, "nth(scores, 0) is 10", test_nth_first);
    return score_finish(&score);
}
