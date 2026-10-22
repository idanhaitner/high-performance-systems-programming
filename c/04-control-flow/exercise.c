// Lesson 4 exercises.
// Replace each not_implemented(...) call with your code.
// From this directory:  make try LESSON=04-control-flow
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int sign(int n) {
    // Return 1 when n is positive, -1 when n is negative, and 0 when n is 0.
    not_implemented("sign");
}

int sum_below(int n) {
    // Return 0 + 1 + ... + (n - 1). When n is 0, return 0. n is never negative.
    not_implemented("sum_below");
}

int product_first(int n) {
    // Return 1 * 2 * ... * n. When n is 0, return 1. n is never negative.
    not_implemented("product_first");
}

const char* label_of(int n) {
    // Return "zero" for 0, "one" for 1, and "other" for every other n.
    not_implemented("label_of");
}

static void test_sign_negative(void) {
    expect_int(sign(-8), -1);
}

static void test_sign_zero(void) {
    expect_int(sign(0), 0);
}

static void test_sum(void) {
    expect_int(sum_below(5), 10);
}

static void test_sum_empty(void) {
    expect_int(sum_below(0), 0);
}

static void test_product(void) {
    expect_int(product_first(4), 24);
}

static void test_product_zero(void) {
    expect_int(product_first(0), 1);
}

static void test_label_one(void) {
    expect_str(label_of(1), "one");
}

static void test_label_other(void) {
    expect_str(label_of(9), "other");
}

int main(void) {
    Score score = {0};
    task(&score, "sign(-8) is -1", test_sign_negative);
    task(&score, "sign(0) is 0", test_sign_zero);
    task(&score, "sum_below(5) is 10", test_sum);
    task(&score, "sum_below(0) is 0", test_sum_empty);
    task(&score, "product_first(4) is 24", test_product);
    task(&score, "product_first(0) is 1", test_product_zero);
    task(&score, "label_of(1) is one", test_label_one);
    task(&score, "label_of(9) is other", test_label_other);
    return score_finish(&score);
}
