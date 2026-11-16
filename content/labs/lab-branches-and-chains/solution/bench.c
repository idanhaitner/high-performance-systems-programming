/* Lab: how much do branches and chains of additions cost?

   This program times two things. First, the same loop with one if, run on
   flags that are sorted and on flags that are random. Second, adding up an
   array with one running total and with four. The one-total version is
   already written. The four-total version, sum_four, is left for you. */

#define _POSIX_C_SOURCE 199309L /* lets <time.h> offer clock_gettime */

#include <stdint.h>
#include <stdio.h>
#include <time.h>

#ifdef SMALL /* make test uses small inputs, so it runs in a moment */
#define FLAGS 1000
#define FLAG_PASSES 1
#define VALUES 1003
#define SUM_PASSES 1
#else
#define FLAGS (1 << 20)   /* about a million flags */
#define FLAG_PASSES 80
#define VALUES 16384      /* small enough to stay in the cache */
#define SUM_PASSES 2000
#endif

/* Big arrays are kept outside any function, because they are too big for the stack. */
static uint8_t flag[FLAGS], out[FLAGS];
static double values[VALUES];

/* Writes 9 wherever a flag is set. The if is a branch in the machine code. */
void update(const uint8_t *f, uint8_t *o, int n) {
    for (int i = 0; i < n; i++) {
        if (f[i])
            o[i] = 9;
    }
}

/* Adds up a with one running total: one long chain of additions. */
double sum_one(const double *a, int n) {
    double sum = 0;
    for (int i = 0; i < n; i++)
        sum += a[i];
    return sum;
}

double sum_four(const double *a, int n) {
    double s0 = 0, s1 = 0, s2 = 0, s3 = 0;
    int i = 0;
    for (; i + 3 < n; i += 4) {
        s0 += a[i];
        s1 += a[i + 1];
        s2 += a[i + 2];
        s3 += a[i + 3];
    }
    double sum = (s0 + s1) + (s2 + s3);
    for (; i < n; i++)
        sum += a[i];
    return sum;
}

/* Fills the flags with about half 1s, in a random order that is the same on every run. */
void random_flags(void) {
    uint32_t x = 12345;
    for (int i = 0; i < FLAGS; i++) {
        x = x * 1664525u + 1013904223u;
        flag[i] = (uint8_t)(x >> 31);
    }
}

/* Puts all the 0s first and all the 1s after, keeping how many of each there are. */
void sort_flags(void) {
    int ones = 0;
    for (int i = 0; i < FLAGS; i++)
        ones += flag[i];
    for (int i = 0; i < FLAGS; i++)
        flag[i] = i >= FLAGS - ones;
}

/* The current time in seconds, from a clock that only moves forward. */
double seconds_now(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

/* Clears out, then runs update FLAG_PASSES times and returns the time in milliseconds. */
double time_update(void) {
    for (int i = 0; i < FLAGS; i++)
        out[i] = 0;
    double start = seconds_now();
    for (int p = 0; p < FLAG_PASSES; p++)
        update(flag, out, FLAGS);
    return (seconds_now() - start) * 1000;
}

int main(void) {
    random_flags();
    double random_ms = time_update();
    sort_flags();
    double sorted_ms = time_update();

    int nines = 0;
    for (int i = 0; i < FLAGS; i++)
        nines += out[i] == 9;
    printf("Branch: %d flags, %d passes, %d of them set\n", FLAGS, FLAG_PASSES, nines);
    printf("  random flags: %8.2f ms\n", random_ms);
    printf("  sorted flags: %8.2f ms\n", sorted_ms);
    if (sorted_ms > 0)
        printf("  random took %.1f times as long as sorted.\n", random_ms / sorted_ms);

    for (int i = 0; i < VALUES; i++)
        values[i] = (i * 7) % 10; /* small whole numbers, so every sum is exact */

    double one = 0, four = 0;
    double start = seconds_now();
    for (int p = 0; p < SUM_PASSES; p++)
        one += sum_one(values, VALUES);
    double one_ms = (seconds_now() - start) * 1000;

    start = seconds_now();
    for (int p = 0; p < SUM_PASSES; p++)
        four += sum_four(values, VALUES);
    double four_ms = (seconds_now() - start) * 1000;

    printf("Sum: %d doubles, %d passes\n", VALUES, SUM_PASSES);
    printf("  one running total:   %8.2f ms\n", one_ms);
    printf("  four running totals: %8.2f ms\n", four_ms);

    if (four != one) {
        printf("WRONG: sum_four gave %.0f, but it should be %.0f. Finish sum_four in bench.c.\n", four, one);
        return 1;
    }
    printf("OK: both sums give the same answer.\n");
    if (four_ms > 0)
        printf("One total took %.1f times as long as four.\n", one_ms / four_ms);
    return 0;
}
