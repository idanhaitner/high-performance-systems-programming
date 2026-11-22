#include <pthread.h>

typedef struct {
    const int *a;
    int begin, end;
    long long sum;
} Task;

void *partial_sum(void *arg) {
    Task *t = arg;
    t->sum = 0;
    for (int i = t->begin; i < t->end; i++)
        t->sum += t->a[i];
    return NULL;
}

long long parallel_sum(const int *a, int n, int workers) {
    Task tasks[8];
    pthread_t threads[8];
    for (int w = 0; w < workers; w++) {
        tasks[w].a = a;
        tasks[w].begin = (int)((long long)w * n / workers);
        tasks[w].end = (int)((long long)(w + 1) * n / workers);
        pthread_create(&threads[w], NULL, partial_sum, &tasks[w]);
    }
    long long total = 0;
    for (int w = 0; w < workers; w++) {
        pthread_join(threads[w], NULL);
        total += tasks[w].sum;
    }
    return total;
}
