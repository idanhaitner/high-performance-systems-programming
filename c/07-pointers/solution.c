// Finished lesson 7. Write yours in exercise.c first.

#include "check.h"

int read_or(const int* p, int fallback) {
    if (p == 0) {
        return fallback;
    }
    return *p;
}

void set_to(int* p, int value) {
    *p = value;
}

void swap_ints(int* a, int* b) {
    int saved = *a;
    *a = *b;
    *b = saved;
}

int nth(const int* a, int i) {
    return a[i];
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
