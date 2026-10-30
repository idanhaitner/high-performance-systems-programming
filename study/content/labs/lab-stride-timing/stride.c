/* Lab: does the order you read memory in change the speed?

   This program fills a grid of N x N ints, then adds up every number twice:
   once row by row, and once column by column. It times both and prints
   the results. */

#define _POSIX_C_SOURCE 199309L /* lets <time.h> offer clock_gettime */

#include <stdio.h>
#include <time.h>

#ifndef N
#define N 4096 /* rows and columns; make test builds a smaller grid */
#endif

/* N x N ints: 4096 * 4096 * 4 bytes = 64 MB. That is too big to create
   inside a function, so the grid is made once, here, outside any function.
   You will learn why in the lesson "Programs and processes". */
int grid[N][N];

long long sum_rows(void) {
    return 0;
}

long long sum_cols(void) {
    return 0;
}

/* Puts i + j in row i, column j. */
void fill_grid(void) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            grid[i][j] = i + j;
        }
    }
}

/* The current time in seconds, from a clock that only moves forward. */
double seconds_now(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

int main(void) {
    /* Every row adds up to the same pattern, so the total has a formula:
       N * N * (N - 1). For N = 4096 that is 68 702 699 520, far too big
       for an int, which is why the sums are long long. */
    long long expected = (long long)N * N * (N - 1);

    fill_grid();

    double start = seconds_now();
    long long by_rows = sum_rows();
    double rows_time = seconds_now() - start;

    start = seconds_now();
    long long by_cols = sum_cols();
    double cols_time = seconds_now() - start;

    printf("Grid: %d x %d ints (%lld MB)\n", N, N, (long long)sizeof grid / (1024 * 1024));
    printf("row by row:       sum = %lld, time = %.4f s\n", by_rows, rows_time);
    printf("column by column: sum = %lld, time = %.4f s\n", by_cols, cols_time);

    if (by_rows != expected || by_cols != expected) {
        printf("WRONG: both sums should be %lld. Finish sum_rows and sum_cols in stride.c.\n", expected);
        return 1;
    }
    printf("OK: both sums are %lld.\n", expected);
    if (rows_time > 0) {
        printf("Column by column took %.1f times as long as row by row.\n", cols_time / rows_time);
    }
    return 0;
}
