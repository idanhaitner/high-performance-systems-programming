/* Lab: what do threads gain, and what do they cost?

   This program times two things. First, adding up a big array with 1, 2, 4,
   and 8 threads, and the same with a tiny array. Second, four threads that
   add to one shared counter in three different ways. The worker that adds up
   one range, partial_sum, is already written. parallel_sum, which starts the
   threads, waits for them, and combines their sums, is left for you. */

#define _POSIX_C_SOURCE 199309L /* lets <time.h> offer clock_gettime */

#include <pthread.h>
#include <stdatomic.h>
#include <stdio.h>
#include <time.h>

#ifdef SMALL /* make test uses small inputs, so it runs in a moment */
#define BIG 100003
#define TINY 7
#define PASSES 1
#define INCREMENTS 20000
#else
#define BIG (1 << 24)     /* about 16 million ints, 64 MB */
#define TINY 1000
#define PASSES 10
#define INCREMENTS 1000000
#endif

#define MAX_WORKERS 8
#define COUNTER_THREADS 4

/* The big array is kept outside any function, because it is too big for the stack. */
static int values[BIG];

typedef struct {
    const int *a;
    long begin;      /* first index of this thread's range */
    long end;        /* one past the last index */
    long long sum;   /* this thread's answer */
} Task;

/* Adds up one range of the array into the task's own sum field. */
void *partial_sum(void *arg) {
    Task *t = arg;
    long long s = 0;
    for (long i = t->begin; i < t->end; i++)
        s += t->a[i];
    t->sum = s;
    return NULL;
}

long long parallel_sum(const int *a, long n, int workers) {
    return 0;
}

/* Adds up the array with no threads at all: the answer every version must match. */
long long plain_sum(const int *a, long n) {
    long long s = 0;
    for (long i = 0; i < n; i++)
        s += a[i];
    return s;
}

/* The current time in seconds, from a clock that only moves forward. */
double seconds_now(void) {
    struct timespec t;
    clock_gettime(CLOCK_MONOTONIC, &t);
    return (double)t.tv_sec + (double)t.tv_nsec / 1e9;
}

/* Three ways for COUNTER_THREADS threads to add INCREMENTS each to one shared counter. */
static long counter = 0;
static atomic_long atomic_counter = 0;
static pthread_mutex_t counter_lock = PTHREAD_MUTEX_INITIALIZER;

void *lock_every_time(void *arg) {
    for (long i = 0; i < INCREMENTS; i++) {
        pthread_mutex_lock(&counter_lock);
        counter++;
        pthread_mutex_unlock(&counter_lock);
    }
    return NULL;
}

void *count_then_lock_once(void *arg) {
    long local = 0;
    for (long i = 0; i < INCREMENTS; i++)
        local++;
    pthread_mutex_lock(&counter_lock);
    counter += local;
    pthread_mutex_unlock(&counter_lock);
    return NULL;
}

void *atomic_every_time(void *arg) {
    for (long i = 0; i < INCREMENTS; i++)
        atomic_fetch_add(&atomic_counter, 1);
    return NULL;
}

/* Runs one counter version on COUNTER_THREADS threads and returns the time in milliseconds. */
double time_counter(void *(*fn)(void *)) {
    pthread_t threads[COUNTER_THREADS];
    double start = seconds_now();
    for (int w = 0; w < COUNTER_THREADS; w++)
        pthread_create(&threads[w], NULL, fn, NULL);
    for (int w = 0; w < COUNTER_THREADS; w++)
        pthread_join(threads[w], NULL);
    return (seconds_now() - start) * 1000;
}

/* Times PASSES calls of parallel_sum and returns the time in milliseconds. */
double time_sum(long n, int workers, long long want, int *ok) {
    double start = seconds_now();
    for (int p = 0; p < PASSES; p++)
        if (parallel_sum(values, n, workers) != want)
            *ok = 0;
    return (seconds_now() - start) * 1000;
}

int main(void) {
    for (long i = 0; i < BIG; i++)
        values[i] = (int)((i * 7) % 100); /* small numbers, the same on every run */

    int ok = 1;
    long sizes[2] = {BIG, TINY};
    for (int s = 0; s < 2; s++) {
        long n = sizes[s];
        long long want = plain_sum(values, n);
        printf("Sum of %ld ints, %d passes:\n", n, PASSES);
        double one_ms = 0;
        for (int workers = 1; workers <= MAX_WORKERS; workers *= 2) {
            double ms = time_sum(n, workers, want, &ok);
            if (workers == 1)
                one_ms = ms;
            double speedup = ms > 0 ? one_ms / ms : 0;
            printf("  %d thread(s): %9.3f ms   speedup %5.2f   efficiency %4.0f%%\n",
                   workers, ms, speedup, 100 * speedup / workers);
        }
    }
    if (!ok) {
        printf("WRONG: parallel_sum gave %lld for %d ints, but it should be %lld. Finish parallel_sum in bench.c.\n",
               parallel_sum(values, BIG, 4), BIG, plain_sum(values, BIG));
        return 1;
    }
    printf("OK: parallel_sum gives the right answer for every number of threads.\n");

    long want_count = (long)COUNTER_THREADS * INCREMENTS;
    printf("Shared counter, %d threads, %d increments each:\n", COUNTER_THREADS, INCREMENTS);
    counter = 0;
    double every_ms = time_counter(lock_every_time);
    long every = counter;
    counter = 0;
    double once_ms = time_counter(count_then_lock_once);
    long once = counter;
    double atomic_ms = time_counter(atomic_every_time);
    long atomics = atomic_load(&atomic_counter);
    printf("  lock on every increment:  %9.3f ms   total %ld\n", every_ms, every);
    printf("  count locally, lock once: %9.3f ms   total %ld\n", once_ms, once);
    printf("  atomic on every increment:%9.3f ms   total %ld\n", atomic_ms, atomics);
    if (every != want_count || once != want_count || atomics != want_count) {
        printf("WRONG: every total should be %ld.\n", want_count);
        return 1;
    }
    printf("OK: all three counters reach %ld.\n", want_count);
    return 0;
}
