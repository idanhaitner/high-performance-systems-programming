#include <pthread.h>
#include <stdatomic.h>
#include "par.h"

/* par_dot: static ranges, one partial sum per task, combined after the joins. */
typedef struct {
    const int *a, *b;
    int begin, end;
    long long sum;
} DotTask;

static void *dot_range(void *arg) {
    DotTask *t = arg;
    long long s = 0;
    for (int i = t->begin; i < t->end; i++)
        s += (long long)t->a[i] * t->b[i];
    t->sum = s;
    return NULL;
}

long long par_dot(const int *a, const int *b, int n, int workers) {
    DotTask tasks[PAR_MAX_WORKERS];
    pthread_t threads[PAR_MAX_WORKERS];
    for (int w = 0; w < workers; w++) {
        tasks[w].a = a;
        tasks[w].b = b;
        tasks[w].begin = (int)((long long)w * n / workers);
        tasks[w].end = (int)((long long)(w + 1) * n / workers);
        pthread_create(&threads[w], NULL, dot_range, &tasks[w]);
    }
    long long total = 0;
    for (int w = 0; w < workers; w++) {
        pthread_join(threads[w], NULL);
        total += tasks[w].sum;
    }
    return total;
}

/* par_max: one private maximum per task. An empty range reports that it has none. */
typedef struct {
    const int *a;
    int begin, end;
    int has_max;
    int max;
} MaxTask;

static void *max_range(void *arg) {
    MaxTask *t = arg;
    t->has_max = t->begin < t->end;
    if (!t->has_max)
        return NULL;
    int m = t->a[t->begin];
    for (int i = t->begin + 1; i < t->end; i++)
        if (t->a[i] > m)
            m = t->a[i];
    t->max = m;
    return NULL;
}

int par_max(const int *a, int n, int workers) {
    MaxTask tasks[PAR_MAX_WORKERS];
    pthread_t threads[PAR_MAX_WORKERS];
    for (int w = 0; w < workers; w++) {
        tasks[w].a = a;
        tasks[w].begin = (int)((long long)w * n / workers);
        tasks[w].end = (int)((long long)(w + 1) * n / workers);
        pthread_create(&threads[w], NULL, max_range, &tasks[w]);
    }
    int best = a[0];
    for (int w = 0; w < workers; w++) {
        pthread_join(threads[w], NULL);
        if (tasks[w].has_max && tasks[w].max > best)
            best = tasks[w].max;
    }
    return best;
}

/* par_count_above: dynamic chunks taken with an atomic ticket, one atomic add per thread. */
typedef struct {
    const int *a;
    int n, chunk, limit;
    atomic_int next_chunk;
    atomic_long total;
} CountJob;

static void *count_chunks(void *arg) {
    CountJob *job = arg;
    long local = 0;
    while (1) {
        int c = atomic_fetch_add(&job->next_chunk, 1);
        long begin = (long)c * job->chunk;
        if (begin >= job->n)
            break;
        long end = begin + job->chunk < job->n ? begin + job->chunk : job->n;
        for (long i = begin; i < end; i++)
            if (job->a[i] > job->limit)
                local++;
    }
    atomic_fetch_add(&job->total, local);
    return NULL;
}

long par_count_above(const int *a, int n, int workers, int chunk, int limit) {
    CountJob job;
    job.a = a;
    job.n = n;
    job.chunk = chunk;
    job.limit = limit;
    atomic_init(&job.next_chunk, 0);
    atomic_init(&job.total, 0);
    pthread_t threads[PAR_MAX_WORKERS];
    for (int w = 0; w < workers; w++)
        pthread_create(&threads[w], NULL, count_chunks, &job);
    for (int w = 0; w < workers; w++)
        pthread_join(threads[w], NULL);
    return atomic_load(&job.total);
}
