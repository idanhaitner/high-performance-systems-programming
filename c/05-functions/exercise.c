// Lesson 5 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=05-functions
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int plus_one(int n) {
    // Return n + 1.
    return n + 1;
}

int bigger(int a, int b) {
    // Return the larger of a and b. When they are equal, return that value.
    if (a > b) {
        return a;
    }
    return b;
}

int smaller(int a, int b) {
    // Return the smaller of a and b. When they are equal, return that value.
    if (a < b) {
        return a;
    }
    return b;
}

int clamped(int n, int lo, int hi) {
    // lo is less than or equal to hi.
    // Return lo when n is below lo, hi when n is above hi, otherwise n.
    // Example: clamped(10, 0, 3) is 3, and clamped(2, 0, 3) is 2.
    if (n < lo) {
        return lo;
    }
    if (n > hi) {
        return hi;
    }
    return n;
}

int twice(int n) {
    // Return n multiplied by 2.
    return n * 2;
}

int four_times(int n) {
    // Return n multiplied by 4. Do it by calling twice.
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
