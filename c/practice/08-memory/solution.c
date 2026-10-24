// Practice 08: memory. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=08-memory

#include "../practice.h"

int* make_range(int n) {
    // n is at least 1. Return a new array holding 0, 1, ..., n - 1.
    // malloc counts in bytes, so ask for n times the size of one int.
    int* a = malloc((size_t)n * sizeof *a);
    if (a == NULL) {
        return NULL;
    }
    for (int i = 0; i < n; i++) {
        a[i] = i;
    }
    return a;
}

int* copy_array(const int a[], int n) {
    // n is at least 1. Return a new array with the same n elements.
    int* copy = malloc((size_t)n * sizeof *copy);
    if (copy == NULL) {
        return NULL;
    }
    for (int i = 0; i < n; i++) {
        copy[i] = a[i];
    }
    return copy;
}

char* my_strdup(const char* s) {
    // Return a new copy of the string s.
    // Trap: the copy needs one more char than strlen(s), for the '\0'.
    // You may use strlen and strcpy from <string.h> from now on.
    char* copy = malloc(strlen(s) + 1);
    if (copy == NULL) {
        return NULL;
    }
    strcpy(copy, s);
    return copy;
}

char* concat(const char* a, const char* b) {
    // Return a new string: a followed by b. concat("foot", "ball") is
    // "football".
    size_t la = strlen(a);
    size_t lb = strlen(b);
    char* out = malloc(la + lb + 1);
    if (out == NULL) {
        return NULL;
    }
    // Copy a to the start, then b right after it, including b's '\0'.
    memcpy(out, a, la);
    memcpy(out + la, b, lb + 1);
    return out;
}

char* repeat(const char* s, int times) {
    // times is 0 or more. Return a new string with s written times times.
    // repeat("ab", 3) is "ababab". repeat("ab", 0) is "".
    size_t len = strlen(s);
    char* out = malloc(len * (size_t)times + 1);
    if (out == NULL) {
        return NULL;
    }
    for (int i = 0; i < times; i++) {
        memcpy(out + len * (size_t)i, s, len);
    }
    out[len * (size_t)times] = '\0';
    return out;
}

int* only_evens(const int a[], int n, int* out_count) {
    // Return a new array with only the even elements of a, in order, and
    // write how many there are into *out_count.
    // When there are none, write 0 and return NULL.
    // Hint: count them first, then malloc exactly that many.
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            count++;
        }
    }
    *out_count = count;
    if (count == 0) {
        return NULL;
    }
    int* out = malloc((size_t)count * sizeof *out);
    if (out == NULL) {
        *out_count = 0;
        return NULL;
    }
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] % 2 == 0) {
            out[k++] = a[i];
        }
    }
    return out;
}

int* append(int* a, int n, int value) {
    // a holds n ints and came from malloc (or is NULL when n is 0).
    // Grow it by one place with realloc, put value at the end, and
    // return the new array. On failure, return NULL and leave a alone.
    // realloc may move the array. Keep the result in a new variable:
    // if realloc fails, a is still valid and still the caller's.
    int* bigger = realloc(a, (size_t)(n + 1) * sizeof *bigger);
    if (bigger == NULL) {
        return NULL;
    }
    bigger[n] = value;
    return bigger;
}

int** make_grid(int rows, int cols) {
    // Return a grid of rows x cols ints, all 0, as an array of rows
    // pointers, each pointing at its own row of cols ints.
    // Free it with free_grid below.
    int** grid = malloc((size_t)rows * sizeof *grid);
    if (grid == NULL) {
        return NULL;
    }
    for (int r = 0; r < rows; r++) {
        // calloc is malloc that also sets every byte to 0.
        grid[r] = calloc((size_t)cols, sizeof **grid);
        if (grid[r] == NULL) {
            // Undo the rows already made, so nothing leaks.
            for (int k = 0; k < r; k++) {
                free(grid[k]);
            }
            free(grid);
            return NULL;
        }
    }
    return grid;
}

void free_grid(int** grid, int rows) {
    // Free everything make_grid made: every row, then the array of rows.
    // Free the rows first. After free(grid), grid[r] can no longer be read.
    for (int r = 0; r < rows; r++) {
        free(grid[r]);
    }
    free(grid);
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
