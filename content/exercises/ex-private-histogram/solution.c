#include <pthread.h>

typedef struct {
    const int *a;
    int begin, end;
    long bins[10];
} Task;

void *count_range(void *arg) {
    Task *t = arg;
    for (int v = 0; v < 10; v++)
        t->bins[v] = 0;
    for (int i = t->begin; i < t->end; i++)
        t->bins[t->a[i]]++;
    return NULL;
}

void parallel_histogram(const int *a, int n, int workers, long bins[10]) {
    Task tasks[8];
    pthread_t threads[8];
    for (int v = 0; v < 10; v++)
        bins[v] = 0;
    for (int w = 0; w < workers; w++) {
        tasks[w].a = a;
        tasks[w].begin = w * n / workers;
        tasks[w].end = (w + 1) * n / workers;
        pthread_create(&threads[w], NULL, count_range, &tasks[w]);
    }
    for (int w = 0; w < workers; w++) {
        pthread_join(threads[w], NULL);
        for (int v = 0; v < 10; v++)
            bins[v] += tasks[w].bins[v];
    }
}
