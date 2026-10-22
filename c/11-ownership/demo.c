// Lesson 11 — ownership.
// From this directory:  make run LESSON=11-ownership

#include <stdio.h>
#include <stdlib.h>

struct buffer {
    int* data;
    int length;
};

static struct buffer make_copy(const int* src, int n) {
    struct buffer b;
    b.length = n;
    b.data = malloc((size_t)n * sizeof(int));
    if (b.data == 0) {
        b.length = 0;
        return b;
    }
    for (int i = 0; i < n; i = i + 1) {
        b.data[i] = src[i];
    }
    return b;
}

int main(void) {
    int src[3] = {1, 2, 3};
    struct buffer a = make_copy(src, 3);
    struct buffer b = make_copy(a.data, a.length);
    if (a.data == 0 || b.data == 0) {
        free(a.data);
        free(b.data);
        return 1;
    }
    a.data[0] = 9;
    printf("original now starts with %d\n", a.data[0]);
    printf("copy still starts with %d\n", b.data[0]);
    free(a.data);
    free(b.data);
    return 0;
}
