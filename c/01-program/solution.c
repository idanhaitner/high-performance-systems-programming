// Finished lesson 1. Write yours in exercise.c first.

#include "check.h"

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int double_of(int n) {
    return n * 2;
}

int negate(int n) {
    return -n;
}

static void test_add_positive(void) {
    expect_int(add(2, 3), 5);
}

static void test_add_to_zero(void) {
    expect_int(add(-1, 1), 0);
}

static void test_subtract(void) {
    expect_int(subtract(10, 3), 7);
}

static void test_subtract_negative(void) {
    expect_int(subtract(3, 10), -7);
}

static void test_double(void) {
    expect_int(double_of(21), 42);
}

static void test_negate(void) {
    expect_int(negate(4), -4);
}

static void test_negate_zero(void) {
    expect_int(negate(0), 0);
}

int main(void) {
    Score score = {0};
    task(&score, "add(2, 3) is 5", test_add_positive);
    task(&score, "add(-1, 1) is 0", test_add_to_zero);
    task(&score, "subtract(10, 3) is 7", test_subtract);
    task(&score, "subtract(3, 10) is -7", test_subtract_negative);
    task(&score, "double_of(21) is 42", test_double);
    task(&score, "negate(4) is -4", test_negate);
    task(&score, "negate(0) is 0", test_negate_zero);
    return score_finish(&score);
}
