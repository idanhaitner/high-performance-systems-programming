// Practice 07: pointers. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=07-pointers

#include "../practice.h"

void set_to_zero(int* p) {
    // Set the int that p points at to 0.
    *p = 0;
}

void swap(int* a, int* b) {
    // Swap the two ints that a and b point at. The classic pointer example.
    // Without pointers, swap would only change its own copies.
    int temp = *a;
    *a = *b;
    *b = temp;
}

void divide(int a, int b, int* quotient, int* remainder) {
    // b is not 0. Write a / b into *quotient and a % b into *remainder.
    *quotient = a / b;
    *remainder = a % b;
}

void min_max(const int a[], int n, int* min, int* max) {
    // n is at least 1. Write the smallest element into *min and the
    // largest into *max.
    *min = a[0];
    *max = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] < *min) {
            *min = a[i];
        }
        if (a[i] > *max) {
            *max = a[i];
        }
    }
}

bool safe_divide(int a, int b, int* result) {
    // When b is 0, return false and leave *result alone.
    // Otherwise write a / b into *result and return true.
    // The return value says whether the answer in *result is valid.
    if (b == 0) {
        return false;
    }
    *result = a / b;
    return true;
}

void add_to_all(int* a, int n, int amount) {
    // Add amount to each of the n ints starting at a.
    for (int i = 0; i < n; i++) {
        a[i] += amount;  // a[i] means *(a + i)
    }
}

int sum_range(const int* begin, const int* end) {
    // Sum the ints from begin up to, but not including, end.
    // Walk with the pointer itself: p++ moves p to the next int.
    int total = 0;
    for (const int* p = begin; p != end; p++) {
        total += *p;
    }
    return total;
}

int* largest(int* a, int n) {
    // n is at least 1. Return a pointer to the largest element (the
    // first, if there is a tie). The caller can then change it through
    // the pointer.
    int* best = a;
    for (int i = 1; i < n; i++) {
        if (a[i] > *best) {
            best = &a[i];  // remember the address, not just the value
        }
    }
    return best;
}

const char* find_char(const char* s, char c) {
    // Return a pointer to the first c in s, or NULL when there is none.
    for (const char* p = s; *p != '\0'; p++) {
        if (*p == c) {
            return p;
        }
    }
    return NULL;
}

void split_name(const char* full, char* first, char* last) {
    // full is a first name, one space, and a last name: "Ada Lovelace".
    // Copy "Ada" into first and "Lovelace" into last, each ending in '\0'.
    // first and last have enough room.
    // Copy until the space into first.
    const char* p = full;
    while (*p != ' ') {
        *first++ = *p++;
    }
    *first = '\0';
    p++;  // step over the space
    // Copy the rest into last.
    while (*p != '\0') {
        *last++ = *p++;
    }
    *last = '\0';
}

static void test_zero(void) {
    int x = 42;
    set_to_zero(&x);
    expect_int(x, 0);
}

static void test_swap(void) {
    int a = 1;
    int b = 2;
    swap(&a, &b);
    expect_int(a, 2);
    expect_int(b, 1);
}

static void test_divide(void) {
    int q = -1;
    int r = -1;
    divide(17, 5, &q, &r);
    expect_int(q, 3);
    expect_int(r, 2);
}

static void test_min_max(void) {
    int a[] = {4, -2, 9, 0};
    int lo = 0;
    int hi = 0;
    min_max(a, 4, &lo, &hi);
    expect_int(lo, -2);
    expect_int(hi, 9);
}

static void test_safe_divide(void) {
    int result = 99;
    expect_true(!safe_divide(5, 0, &result), "5 / 0 returns false");
    expect_int(result, 99);
    expect_true(safe_divide(20, 4, &result), "20 / 4 returns true");
    expect_int(result, 5);
}

static void test_add_all(void) {
    int a[] = {1, 2, 3};
    add_to_all(a, 3, 10);
    expect_int(a[0], 11);
    expect_int(a[1], 12);
    expect_int(a[2], 13);
}

static void test_sum_range(void) {
    int a[] = {1, 2, 3, 4, 5};
    expect_int(sum_range(a, a + 5), 15);
    expect_int(sum_range(a + 1, a + 3), 5);
    expect_int(sum_range(a, a), 0);
}

static void test_largest(void) {
    int a[] = {3, 8, 1, 8};
    int* p = largest(a, 4);
    expect_ptr(p, &a[1]);
    *p = 0;
    expect_int(a[1], 0);
}

static void test_find(void) {
    const char* s = "hello";
    expect_ptr(find_char(s, 'l'), s + 2);
    expect_ptr(find_char(s, 'z'), NULL);
}

static void test_split(void) {
    char first[16];
    char last[16];
    split_name("Ada Lovelace", first, last);
    expect_str(first, "Ada");
    expect_str(last, "Lovelace");
}

int main(void) {
    Score score = {0};
    task(&score, "set_to_zero", test_zero);
    task(&score, "swap", test_swap);
    task(&score, "divide", test_divide);
    task(&score, "min_max", test_min_max);
    task(&score, "safe_divide", test_safe_divide);
    task(&score, "add_to_all", test_add_all);
    task(&score, "sum_range", test_sum_range);
    task(&score, "largest", test_largest);
    task(&score, "find_char", test_find);
    task(&score, "split_name", test_split);
    return score_finish(&score);
}
