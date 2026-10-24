// Lesson 6 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=06-arrays-and-strings
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int sum_array(const int* a, int n) {
    // Return the sum of the n elements starting at a.
    // When n is 0, return 0 and do not read a.
    int sum = 0;
    for (int i = 0; i < n; i = i + 1) {
        sum = sum + a[i];
    }
    return sum;
}

int max_array(const int* a, int n) {
    // Return the largest of the n elements starting at a. n is at least 1.
    // The elements may all be negative, so do not start your answer at 0.
    int best = a[0];
    for (int i = 1; i < n; i = i + 1) {
        if (a[i] > best) {
            best = a[i];
        }
    }
    return best;
}

int string_length(const char* s) {
    // Return the number of characters before the first '\0'.
    // An empty string has length 0.
    int length = 0;
    while (s[length] != '\0') {
        length = length + 1;
    }
    return length;
}

int count_char(const char* s, char c) {
    // Return how many times c appears before the first '\0'.
    // Example: count_char("ababa", 'a') is 3.
    int count = 0;
    for (int i = 0; s[i] != '\0'; i = i + 1) {
        if (s[i] == c) {
            count = count + 1;
        }
    }
    return count;
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
