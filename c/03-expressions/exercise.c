// Lesson 3 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=03-expressions
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int divided(int a, int b) {
    // Return the integer quotient a / b. b is not 0.
    // Integer division drops the fraction, cutting toward zero: -5 / 2 is -2.
    return a / b;
}

int leftover(int a, int b) {
    // Return the remainder a % b. b is not 0.
    // The remainder has the same sign as a: -5 % 2 is -1.
    return a % b;
}

int bumped(int n) {
    // Return n + 1.
    return n + 1;
}

int yield_then_bump(int n) {
    // Return the value that the expression n++ gives.
    // n++ gives the old value of n, then adds one, so the answer is
    // the value n had when the function started.
    return n++;
}

int same(int a, int b) {
    // Return 1 when a and b are equal, otherwise 0.
    // Hint: one operator already gives exactly 1 or 0.
    return a == b;
}

static void test_half(void) {
    expect_int(divided(5, 2), 2);
}

static void test_negative_half(void) {
    expect_int(divided(-5, 2), -2);
}

static void test_remainder(void) {
    expect_int(leftover(5, 2), 1);
}

static void test_negative_remainder(void) {
    expect_int(leftover(-5, 2), -1);
}

static void test_bumped(void) {
    expect_int(bumped(3), 4);
}

static void test_post(void) {
    expect_int(yield_then_bump(3), 3);
}

static void test_same(void) {
    expect_int(same(4, 4), 1);
}

static void test_different(void) {
    expect_int(same(4, 5), 0);
}

int main(void) {
    Score score = {0};
    task(&score, "divided(5, 2) is 2", test_half);
    task(&score, "divided(-5, 2) is -2", test_negative_half);
    task(&score, "leftover(5, 2) is 1", test_remainder);
    task(&score, "leftover(-5, 2) is -1", test_negative_remainder);
    task(&score, "bumped(3) is 4", test_bumped);
    task(&score, "yield_then_bump(3) is 3", test_post);
    task(&score, "same(4, 4) is 1", test_same);
    task(&score, "same(4, 5) is 0", test_different);
    return score_finish(&score);
}
