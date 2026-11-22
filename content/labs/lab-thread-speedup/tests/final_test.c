/* The checks behind "make final". You do not need to change this file.
   Each check compares your function with a simple one-thread version of it. */
#include <stdio.h>
#include "par.h"

static int wrong = 0;

static void check(int ok, const char *what, const char *help) {
    if (ok) {
        printf("OK     %s\n", what);
    } else {
        printf("WRONG  %s: %s\n", what, help);
        wrong = 1;
    }
}

static long long slow_dot(const int *a, const int *b, int n) {
    long long s = 0;
    for (int i = 0; i < n; i++)
        s += (long long)a[i] * b[i];
    return s;
}

static int slow_max(const int *a, int n) {
    int m = a[0];
    for (int i = 1; i < n; i++)
        if (a[i] > m)
            m = a[i];
    return m;
}

static long slow_count_above(const int *a, int n, int limit) {
    long c = 0;
    for (int i = 0; i < n; i++)
        if (a[i] > limit)
            c++;
    return c;
}

/* Numbers in a fixed but mixed-up order, from -500 to 499. */
static int mixed(int i) {
    return (int)(((long)i * 7919 + 13) % 1000) - 500;
}

#define N 100000
static int a[N], b[N];

int main(void) {
    for (int i = 0; i < N; i++) {
        a[i] = mixed(i);
        b[i] = mixed(i + 4242);
    }
    a[77777] = 123456; /* one big value, far from the start */

    int sizes[4] = {N, 1000, 5, 1};
    int workers[4] = {1, 3, 4, 8};
    int dot_ok = 1, max_ok = 1, count_ok = 1;
    for (int s = 0; s < 4; s++)
        for (int w = 0; w < 4; w++) {
            int n = sizes[s];
            if (par_dot(a, b, n, workers[w]) != slow_dot(a, b, n))
                dot_ok = 0;
            if (par_max(a, n, workers[w]) != slow_max(a, n))
                max_ok = 0;
            int chunks[3] = {1, 64, 5000};
            for (int c = 0; c < 3; c++)
                if (par_count_above(a, n, workers[w], chunks[c], 100) != slow_count_above(a, n, 100))
                    count_ok = 0;
        }

    int neg[6] = {-9, -4, -30, -4, -12, -50};
    int neg_ok = par_max(neg, 6, 4) == -4 && par_max(neg, 6, 8) == -4;

    check(dot_ok, "par_dot matches the one-thread sum for every size and number of threads",
          "split the indexes into ranges, give each thread its own sum, and add the sums after the joins");
    check(max_ok, "par_max finds the largest value for every size and number of threads",
          "a thread whose range is empty must not read a[begin], and must not count as a maximum");
    check(neg_ok, "par_max works when every value is negative",
          "do not start the maximum at 0. Start from a real element of the array");
    check(count_ok, "par_count_above counts every value above the limit exactly once",
          "take chunk numbers with atomic_fetch_add, stop when a chunk starts at or after n, and add each thread's count once");

    if (wrong)
        return 1;
    printf("OK: every final check passes.\n");
    return 0;
}
