/* Lab: does the order of the loops change the speed of a matrix multiplication?

   This program multiplies two N x N matrices of doubles, A and B, into C.
   It does the multiplication twice, with the loops in two different orders,
   and times both. The first order, i-j-k, is already written. The second
   order, i-k-j, is left for you. */

#define _POSIX_C_SOURCE 199309L /* lets <time.h> offer clock_gettime */

#include <stdio.h>
#include <time.h>

#ifndef N
#define N 512 /* rows and columns; make test builds smaller matrices */
#endif

/* The matrices are kept outside any function, because they are too big
   for the stack. Each one is stored row by row. */
static double A[N][N], B[N][N], C[N][N];

/* The natural order. The inner loop moves down a column of B. */
void multiply_ijk(void) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            double sum = 0;
            for (int k = 0; k < N; k++)
                sum += A[i][k] * B[k][j];
            C[i][j] = sum;
        }
    }
}

/* The cache-friendly order. The inner loop moves along a row of B and a row of C. */
void multiply_ikj(void) {
    for (int i = 0; i < N; i++) {
        for (int k = 0; k < N; k++) {
            double aik = A[i][k];
            for (int j = 0; j < N; j++)
                C[i][j] += aik * B[k][j];
        }
    }
}

/* Fills A and B with small whole numbers, so every sum is exact. */
void fill_inputs(void) {
    for (int i = 0; i < N; i++) {
        for (int j = 0; j < N; j++) {
            A[i][j] = (i + j) % 7;
            B[i][j] = (i * 3 + j) % 5;
        }
    }
}

void clear_c(void) {
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            C[i][j] = 0;
}

/* The sum of every number of C. */
double checksum(void) {
    double total = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            total += C[i][j];
    return total;
}

/* The current time in seconds, from a clock that only moves forward. */
double seconds_now(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

int main(void) {
    fill_inputs();

    clear_c();
    double start = seconds_now();
    multiply_ijk();
    double ijk_time = seconds_now() - start;
    double expected = checksum();

    clear_c();
    start = seconds_now();
    multiply_ikj();
    double ikj_time = seconds_now() - start;
    double got = checksum();

    printf("Matrices: %d x %d doubles (%d MB each)\n", N, N, (int)(sizeof(A) / (1024 * 1024)));
    printf("i-j-k: time = %.4f s\n", ijk_time);
    printf("i-k-j: time = %.4f s\n", ikj_time);

    if (got != expected) {
        printf("WRONG: i-k-j gave a checksum of %.0f, but it should be %.0f. Finish multiply_ikj in matmul.c.\n",
               got, expected);
        return 1;
    }
    printf("OK: both orders give the same answer.\n");
    if (ikj_time > 0)
        printf("i-j-k took %.1f times as long as i-k-j.\n", ijk_time / ikj_time);
    return 0;
}
