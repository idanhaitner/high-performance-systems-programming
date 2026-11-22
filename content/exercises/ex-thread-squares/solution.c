#include <pthread.h>

typedef struct {
    int x;
    int square;
} Job;

void *square_job(void *arg) {
    Job *j = arg;
    j->square = j->x * j->x;
    return NULL;
}

void squares(const int *in, int *out, int n) {
    Job jobs[8];
    pthread_t threads[8];
    for (int i = 0; i < n; i++) {
        jobs[i].x = in[i];
        pthread_create(&threads[i], NULL, square_job, &jobs[i]);
    }
    for (int i = 0; i < n; i++) {
        pthread_join(threads[i], NULL);
        out[i] = jobs[i].square;
    }
}
