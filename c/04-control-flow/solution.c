// Finished lesson 4. Write yours in exercise.c first.

#include "check.h"

int sign(int n) {
    if (n > 0) {
        return 1;
    }
    if (n < 0) {
        return -1;
    }
    return 0;
}

int sum_below(int n) {
    int sum = 0;
    int i = 0;
    while (i < n) {
        sum = sum + i;
        i = i + 1;
    }
    return sum;
}

int product_first(int n) {
    int product = 1;
    for (int k = 1; k <= n; k = k + 1) {
        product = product * k;
    }
    return product;
}

const char* label_of(int n) {
    switch (n) {
    case 0:
        return "zero";
    case 1:
        return "one";
    default:
        return "other";
    }
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
