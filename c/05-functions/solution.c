// Finished lesson 5. Write yours in exercise.c first.

#include "check.h"

int plus_one(int n) {
    return n + 1;
}

// When a and b are equal, a > b is false and b is returned. That is
// the same value, so the tie needs no special case.
int bigger(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int smaller(int a, int b) {
    if (a < b) {
        return a;
    }
    return b;
}

// Clamping keeps n inside the range lo..hi: too small becomes lo, too
// big becomes hi, and anything already inside stays as it is.
int clamped(int n, int lo, int hi) {
    if (n < lo) {
        return lo;
    }
    if (n > hi) {
        return hi;
    }
    return n;
}

int twice(int n) {
    return n * 2;
}

// Four times n is twice of twice of n. Reusing twice means the
// multiplication is written in only one place.
int four_times(int n) {
    return twice(twice(n));
}

static void test_plus_one(void) {
    expect_int(plus_one(3), 4);
}

static void test_plus_one_negative(void) {
    expect_int(plus_one(-1), 0);
}

static void test_bigger(void) {
    expect_int(bigger(2, 5), 5);
}

static void test_bigger_tied(void) {
    expect_int(bigger(4, 4), 4);
}

static void test_smaller(void) {
    expect_int(smaller(2, 5), 2);
}

static void test_clamp_high(void) {
    expect_int(clamped(10, 0, 3), 3);
}

static void test_clamp_low(void) {
    expect_int(clamped(-1, 0, 3), 0);
}

static void test_four(void) {
    expect_int(four_times(3), 12);
}

int main(void) {
    Score score = {0};
    task(&score, "plus_one(3) is 4", test_plus_one);
    task(&score, "plus_one(-1) is 0", test_plus_one_negative);
    task(&score, "bigger(2, 5) is 5", test_bigger);
    task(&score, "bigger(4, 4) is 4", test_bigger_tied);
    task(&score, "smaller(2, 5) is 2", test_smaller);
    task(&score, "clamped(10, 0, 3) is 3", test_clamp_high);
    task(&score, "clamped(-1, 0, 3) is 0", test_clamp_low);
    task(&score, "four_times(3) is 12", test_four);
    return score_finish(&score);
}
