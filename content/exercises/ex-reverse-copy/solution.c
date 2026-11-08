#include <stdlib.h>

int *reverse_copy(int *a, int n) {
    int *r = malloc(n * sizeof(int)); /* on the heap, so it outlives this function */
    if (r == NULL)
        return NULL;
    for (int i = 0; i < n; i++)
        r[i] = a[n - 1 - i]; /* element i comes from the other end */
    return r;
}
