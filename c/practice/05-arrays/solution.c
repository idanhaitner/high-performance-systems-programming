// Practice 05: arrays. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=05-arrays

#include "../practice.h"

int array_sum(const int a[], int n) {
    // Return the sum of all n elements. An empty array (n is 0) sums to 0.
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += a[i];
    }
    return total;
}

double array_average(const int a[], int n) {
    // n is at least 1. Return the average, with the fraction kept.
    // Turn the sum into a double before dividing, so the fraction is kept.
    return (double)array_sum(a, n) / n;
}

int index_of_max(const int a[], int n) {
    // n is at least 1. Return the position of the largest element.
    // If it appears more than once, return the first position.
    // Remember where the best value is, not just what it is.
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (a[i] > a[best]) {
            best = i;
        }
    }
    return best;
}

int count_even(const int a[], int n) {
    // Return how many elements are even.
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            count++;
        }
    }
    return count;
}

int index_of(const int a[], int n, int x) {
    // Return the first position where x appears, or -1 if it is not there.
    for (int i = 0; i < n; i++) {
        if (a[i] == x) {
            return i;  // found it: stop looking
        }
    }
    // Only reached when the loop checked every element and found nothing.
    return -1;
}

void reverse_in_place(int a[], int n) {
    // Reverse the array itself. {1, 2, 3, 4} becomes {4, 3, 2, 1}.
    // Hint: swap the first and last, then the second and second-to-last...
    // i walks from the left and j from the right, until they meet.
    for (int i = 0, j = n - 1; i < j; i++, j--) {
        int temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
}

bool is_sorted(const int a[], int n) {
    // Return true when every element is less than or equal to the next.
    // An array of 0 or 1 elements is sorted.
    // Compare each neighbor pair. One pair in the wrong order is enough.
    for (int i = 0; i + 1 < n; i++) {
        if (a[i] > a[i + 1]) {
            return false;
        }
    }
    return true;
}

int second_largest(const int a[], int n) {
    // The array holds at least two different values. Return the largest
    // value that is smaller than the maximum.
    // {5, 9, 2, 9, 7} gives 7.
    // First pass: find the maximum.
    int max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] > max) {
            max = a[i];
        }
    }
    // Second pass: the biggest value that is below the maximum.
    // found tells us whether second holds a real value yet.
    bool found = false;
    int second = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] < max && (!found || a[i] > second)) {
            second = a[i];
            found = true;
        }
    }
    return second;
}

int count_above_average(const int a[], int n) {
    // n is at least 1. Return how many elements are strictly above the
    // average of the array.
    double average = array_average(a, n);
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > average) {
            count++;
        }
    }
    return count;
}

void rotate_left(int a[], int n) {
    // n is at least 1. Move every element one place to the left, and the
    // first element to the end. {1, 2, 3, 4} becomes {2, 3, 4, 1}.
    // Save the first element before it is overwritten.
    int first = a[0];
    for (int i = 0; i < n - 1; i++) {
        a[i] = a[i + 1];
    }
    a[n - 1] = first;
}

int longest_run(const int a[], int n) {
    // Return the length of the longest stretch of equal neighbors.
    // {1, 1, 2, 2, 2, 3} gives 3. An empty array gives 0.
    if (n == 0) {
        return 0;
    }
    int best = 1;
    int current = 1;
    for (int i = 1; i < n; i++) {
        if (a[i] == a[i - 1]) {
            current++;  // the run goes on
        } else {
            current = 1;  // a new run starts here
        }
        if (current > best) {
            best = current;
        }
    }
    return best;
}

int merge_sorted(const int a[], int na, const int b[], int nb, int out[]) {
    // a and b are each sorted from small to large. Copy all their elements
    // into out, sorted, and return how many were written (na + nb).
    // out has room for them all. A classic exam question.
    // {1, 4, 6} and {2, 3, 7} give {1, 2, 3, 4, 6, 7}.
    // i walks a, j walks b, k is the next free place in out.
    int i = 0;
    int j = 0;
    int k = 0;
    // While both have elements left, take the smaller front element.
    while (i < na && j < nb) {
        if (a[i] <= b[j]) {
            out[k++] = a[i++];
        } else {
            out[k++] = b[j++];
        }
    }
    // One of them ran out. Copy what is left of the other.
    while (i < na) {
        out[k++] = a[i++];
    }
    while (j < nb) {
        out[k++] = b[j++];
    }
    return k;
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
