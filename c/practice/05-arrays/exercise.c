// Practice 05: arrays.
// Every function gets an array a and its length n. A C array does not
// know its own length, so the length always travels next to it.
// Valid positions are 0 to n - 1. Never read a[n].
// From the c folder:  make practice LEVEL=05-arrays
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

int array_sum(const int a[], int n) {
    // Return the sum of all n elements. An empty array (n is 0) sums to 0.
    not_implemented("array_sum");
}

double array_average(const int a[], int n) {
    // n is at least 1. Return the average, with the fraction kept.
    not_implemented("array_average");
}

int index_of_max(const int a[], int n) {
    // n is at least 1. Return the position of the largest element.
    // If it appears more than once, return the first position.
    not_implemented("index_of_max");
}

int count_even(const int a[], int n) {
    // Return how many elements are even.
    not_implemented("count_even");
}

int index_of(const int a[], int n, int x) {
    // Return the first position where x appears, or -1 if it is not there.
    not_implemented("index_of");
}

void reverse_in_place(int a[], int n) {
    // Reverse the array itself. {1, 2, 3, 4} becomes {4, 3, 2, 1}.
    // Hint: swap the first and last, then the second and second-to-last...
    not_implemented("reverse_in_place");
}

bool is_sorted(const int a[], int n) {
    // Return true when every element is less than or equal to the next.
    // An array of 0 or 1 elements is sorted.
    not_implemented("is_sorted");
}

int second_largest(const int a[], int n) {
    // The array holds at least two different values. Return the largest
    // value that is smaller than the maximum.
    // {5, 9, 2, 9, 7} gives 7.
    not_implemented("second_largest");
}

int count_above_average(const int a[], int n) {
    // n is at least 1. Return how many elements are strictly above the
    // average of the array.
    not_implemented("count_above_average");
}

void rotate_left(int a[], int n) {
    // n is at least 1. Move every element one place to the left, and the
    // first element to the end. {1, 2, 3, 4} becomes {2, 3, 4, 1}.
    not_implemented("rotate_left");
}

int longest_run(const int a[], int n) {
    // Return the length of the longest stretch of equal neighbors.
    // {1, 1, 2, 2, 2, 3} gives 3. An empty array gives 0.
    not_implemented("longest_run");
}

int merge_sorted(const int a[], int na, const int b[], int nb, int out[]) {
    // a and b are each sorted from small to large. Copy all their elements
    // into out, sorted, and return how many were written (na + nb).
    // out has room for them all. A classic exam question.
    // {1, 4, 6} and {2, 3, 7} give {1, 2, 3, 4, 6, 7}.
    not_implemented("merge_sorted");
}

/* The checker compares whole arrays with this helper. */
static void expect_array(const int got[], const int want[], int n) {
    for (int i = 0; i < n; i++) {
        if (got[i] != want[i]) {
            char buf[240];
            snprintf(buf, sizeof buf, "at position %d: expected %d, got %d",
                     i, want[i], got[i]);
            fail_check(buf);
        }
    }
}

static void test_sum(void) {
    int a[] = {3, 1, 4, 1, 5};
    expect_int(array_sum(a, 5), 14);
    expect_int(array_sum(a, 0), 0);
}

static void test_average(void) {
    int a[] = {1, 2, 4};
    expect_double(array_average(a, 3), 7.0 / 3.0);
}

static void test_max(void) {
    int a[] = {3, 9, 2, 9};
    int negatives[] = {-4, -2, -8};
    expect_int(index_of_max(a, 4), 1);
    expect_int(index_of_max(negatives, 3), 1);
}

static void test_even(void) {
    int a[] = {1, 2, 3, 4, 6, -8};
    expect_int(count_even(a, 6), 4);
}

static void test_index_of(void) {
    int a[] = {5, 7, 7, 1};
    expect_int(index_of(a, 4, 7), 1);
    expect_int(index_of(a, 4, 4), -1);
}

static void test_reverse(void) {
    int even[] = {1, 2, 3, 4};
    int odd[] = {1, 2, 3};
    int even_want[] = {4, 3, 2, 1};
    int odd_want[] = {3, 2, 1};
    reverse_in_place(even, 4);
    reverse_in_place(odd, 3);
    expect_array(even, even_want, 4);
    expect_array(odd, odd_want, 3);
}

static void test_sorted(void) {
    int yes[] = {1, 2, 2, 5};
    int no[] = {1, 3, 2};
    expect_true(is_sorted(yes, 4), "{1, 2, 2, 5} is sorted");
    expect_true(!is_sorted(no, 3), "{1, 3, 2} is not sorted");
    expect_true(is_sorted(no, 1), "one element is sorted");
}

static void test_second(void) {
    int a[] = {5, 9, 2, 9, 7};
    int b[] = {-1, -5};
    expect_int(second_largest(a, 5), 7);
    expect_int(second_largest(b, 2), -5);
}

static void test_above(void) {
    int a[] = {1, 2, 3, 10};
    expect_int(count_above_average(a, 4), 1);
}

static void test_rotate(void) {
    int a[] = {1, 2, 3, 4};
    int want[] = {2, 3, 4, 1};
    rotate_left(a, 4);
    expect_array(a, want, 4);
}

static void test_run(void) {
    int a[] = {1, 1, 2, 2, 2, 3};
    int b[] = {4, 5, 6};
    expect_int(longest_run(a, 6), 3);
    expect_int(longest_run(b, 3), 1);
    expect_int(longest_run(b, 0), 0);
}

static void test_merge(void) {
    int a[] = {1, 4, 6};
    int b[] = {2, 3, 7, 8};
    int out[7];
    int want[] = {1, 2, 3, 4, 6, 7, 8};
    expect_int(merge_sorted(a, 3, b, 4, out), 7);
    expect_array(out, want, 7);
}

int main(void) {
    Score score = {0};
    task(&score, "array_sum", test_sum);
    task(&score, "array_average", test_average);
    task(&score, "index_of_max", test_max);
    task(&score, "count_even", test_even);
    task(&score, "index_of", test_index_of);
    task(&score, "reverse_in_place", test_reverse);
    task(&score, "is_sorted", test_sorted);
    task(&score, "second_largest", test_second);
    task(&score, "count_above_average", test_above);
    task(&score, "rotate_left", test_rotate);
    task(&score, "longest_run", test_run);
    task(&score, "merge_sorted", test_merge);
    return score_finish(&score);
}
