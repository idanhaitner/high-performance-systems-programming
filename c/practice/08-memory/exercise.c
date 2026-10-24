// Practice 08: memory with malloc and free.
// Each function makes new memory with malloc and returns it. The caller
// (here, the checker) frees it. When malloc returns NULL, return NULL.
// Check for leaks too:  make practice-leaks LEVEL=08-memory
// From the c folder:  make practice LEVEL=08-memory
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

int* make_range(int n) {
    // n is at least 1. Return a new array holding 0, 1, ..., n - 1.
    not_implemented("make_range");
}

int* copy_array(const int a[], int n) {
    // n is at least 1. Return a new array with the same n elements.
    not_implemented("copy_array");
}

char* my_strdup(const char* s) {
    // Return a new copy of the string s.
    // Trap: the copy needs one more char than strlen(s), for the '\0'.
    // You may use strlen and strcpy from <string.h> from now on.
    not_implemented("my_strdup");
}

char* concat(const char* a, const char* b) {
    // Return a new string: a followed by b. concat("foot", "ball") is
    // "football".
    not_implemented("concat");
}

char* repeat(const char* s, int times) {
    // times is 0 or more. Return a new string with s written times times.
    // repeat("ab", 3) is "ababab". repeat("ab", 0) is "".
    not_implemented("repeat");
}

int* only_evens(const int a[], int n, int* out_count) {
    // Return a new array with only the even elements of a, in order, and
    // write how many there are into *out_count.
    // When there are none, write 0 and return NULL.
    // Hint: count them first, then malloc exactly that many.
    not_implemented("only_evens");
}

int* append(int* a, int n, int value) {
    // a holds n ints and came from malloc (or is NULL when n is 0).
    // Grow it by one place with realloc, put value at the end, and
    // return the new array. On failure, return NULL and leave a alone.
    not_implemented("append");
}

int** make_grid(int rows, int cols) {
    // Return a grid of rows x cols ints, all 0, as an array of rows
    // pointers, each pointing at its own row of cols ints.
    // Free it with free_grid below.
    not_implemented("make_grid");
}

void free_grid(int** grid, int rows) {
    // Free everything make_grid made: every row, then the array of rows.
    not_implemented("free_grid");
}

static void test_range(void) {
    int* a = make_range(4);
    expect_true(a != NULL, "make_range returned NULL");
    expect_int(a[0], 0);
    expect_int(a[3], 3);
    free(a);
}

static void test_copy(void) {
    int a[] = {7, 8, 9};
    int* c = copy_array(a, 3);
    expect_true(c != NULL, "copy_array returned NULL");
    expect_true(c != a, "copy_array must return new memory, not a itself");
    expect_int(c[0], 7);
    expect_int(c[2], 9);
    free(c);
}

static void test_strdup(void) {
    char original[] = "hello";
    char* copy = my_strdup(original);
    expect_true(copy != NULL, "my_strdup returned NULL");
    original[0] = 'j';  // changing the original must not change the copy
    expect_str(copy, "hello");
    free(copy);
}

static void test_concat(void) {
    char* s = concat("foot", "ball");
    expect_str(s, "football");
    free(s);
}

static void test_repeat(void) {
    char* s = repeat("ab", 3);
    char* empty = repeat("ab", 0);
    expect_str(s, "ababab");
    expect_str(empty, "");
    free(s);
    free(empty);
}

static void test_evens(void) {
    int a[] = {1, 2, 3, 4, 6};
    int count = -1;
    int* e = only_evens(a, 5, &count);
    expect_true(e != NULL, "only_evens returned NULL");
    expect_int(count, 3);
    expect_int(e[0], 2);
    expect_int(e[2], 6);
    free(e);
}

static void test_no_evens(void) {
    int a[] = {1, 3};
    int count = -1;
    expect_ptr(only_evens(a, 2, &count), NULL);
    expect_int(count, 0);
}

static void test_append(void) {
    int* a = NULL;
    for (int i = 0; i < 5; i++) {
        a = append(a, i, i * 10);
        expect_true(a != NULL, "append returned NULL");
    }
    expect_int(a[0], 0);
    expect_int(a[4], 40);
    free(a);
}

static void test_grid(void) {
    int** g = make_grid(3, 4);
    expect_true(g != NULL, "make_grid returned NULL");
    expect_int(g[2][3], 0);
    g[2][3] = 5;
    expect_int(g[2][3], 5);
    free_grid(g, 3);
}

int main(void) {
    Score score = {0};
    task(&score, "make_range", test_range);
    task(&score, "copy_array", test_copy);
    task(&score, "my_strdup", test_strdup);
    task(&score, "concat", test_concat);
    task(&score, "repeat", test_repeat);
    task(&score, "only_evens", test_evens);
    task(&score, "only_evens with no evens", test_no_evens);
    task(&score, "append five times", test_append);
    task(&score, "make_grid and free_grid", test_grid);
    return score_finish(&score);
}
