// Lesson 6 exercises.
// Replace each not_implemented(...) call with your code.
// From this directory:  make try LESSON=06-arrays-and-strings
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int sum_array(const int* a, int n) {
    // Return the sum of the n elements starting at a.
    // When n is 0, return 0 and do not read a.
    not_implemented("sum_array");
}

int max_array(const int* a, int n) {
    // Return the largest of the n elements starting at a. n is at least 1.
    not_implemented("max_array");
}

int string_length(const char* s) {
    // Return the number of characters before the first '\0'.
    // An empty string has length 0.
    not_implemented("string_length");
}

int count_char(const char* s, char c) {
    // Return how many times c appears before the first '\0'.
    not_implemented("count_char");
}

static void test_sum(void) {
    int scores[3] = {1, 2, 3};
    expect_int(sum_array(scores, 3), 6);
}

static void test_sum_empty(void) {
    expect_int(sum_array(0, 0), 0);
}

static void test_max(void) {
    int scores[3] = {3, 9, 2};
    expect_int(max_array(scores, 3), 9);
}

static void test_max_negative(void) {
    int scores[2] = {-5, -1};
    expect_int(max_array(scores, 2), -1);
}

static void test_length(void) {
    expect_int(string_length("hi"), 2);
}

static void test_length_empty(void) {
    expect_int(string_length(""), 0);
}

static void test_count(void) {
    expect_int(count_char("ababa", 'a'), 3);
}

static void test_count_missing(void) {
    expect_int(count_char("ab", 'z'), 0);
}

int main(void) {
    Score score = {0};
    task(&score, "sum of {1, 2, 3} is 6", test_sum);
    task(&score, "sum of an empty array is 0", test_sum_empty);
    task(&score, "max of {3, 9, 2} is 9", test_max);
    task(&score, "max of {-5, -1} is -1", test_max_negative);
    task(&score, "length of hi is 2", test_length);
    task(&score, "length of an empty string is 0", test_length_empty);
    task(&score, "ababa contains 3 a's", test_count);
    task(&score, "ab contains no z", test_count_missing);
    return score_finish(&score);
}
