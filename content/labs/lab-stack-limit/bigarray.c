/* Lab: how big can a local array be?
   Usage: ./bigarray N [--heap-only]
   Sums N ints twice: once in a heap block, once in a local array on the stack. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/resource.h>

/* The expected total of 0 % 7 + 1 % 7 + ... + (n - 1) % 7. */
static long long expected_sum(long n) {
    long long total = 0;
    for (long i = 0; i < n; i++)
        total += i % 7;
    return total;
}

/* Fills a local array of n ints with i % 7 and adds them up.
   The array lives on the stack, so a big n runs past the stack limit. */
static long long sum_on_stack(long n) {
    int A[n];
    for (long i = 0; i < n; i++)
        A[i] = i % 7;
    long long total = 0;
    for (long i = 0; i < n; i++)
        total += A[i];
    return total;
}

static long long sum_on_heap(long n) {
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc < 2) {
        printf("usage: %s N [--heap-only]\n", argv[0]);
        return 1;
    }
    long n = atol(argv[1]);
    int heap_only = argc > 2 && strcmp(argv[2], "--heap-only") == 0;

    /* 1 MB here is 1024 * 1024 bytes, the way the operating system counts the stack. */
    double array_mb = n * sizeof(int) / (1024.0 * 1024.0);
    double stack_mb = -1;
    struct rlimit limit;
    if (getrlimit(RLIMIT_STACK, &limit) == 0 && limit.rlim_cur != RLIM_INFINITY)
        stack_mb = limit.rlim_cur / (1024.0 * 1024.0);
    if (stack_mb > 0)
        printf("Stack limit: %.1f MB\n", stack_mb);
    else
        printf("Stack limit: unlimited\n");
    printf("Array: %ld ints = %.1f MB\n", n, array_mb);

    long long want = expected_sum(n);
    long long got = sum_on_heap(n);
    if (got != want) {
        printf("heap:  WRONG, sum = %lld but it should be %lld.\n", got, want);
        return 1;
    }
    printf("heap:  OK, sum = %lld\n", got);
    fflush(stdout);

    if (heap_only)
        return 0;
    if (stack_mb > 0 && array_mb > stack_mb)
        printf("stack: the array is bigger than the stack limit, so expect a crash...\n");
    else
        printf("stack: trying a local array of the same size...\n");
    fflush(stdout);
    got = sum_on_stack(n);
    printf("stack: OK, sum = %lld\n", got);
    return 0;
}
