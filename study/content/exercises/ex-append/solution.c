#include <stdlib.h>

int *append(int *a, int *n, int value) {
    int *bigger = realloc(a, (*n + 1) * sizeof(int));
    if (bigger == NULL)
        return a;       /* the old block is still valid and unchanged */
    bigger[*n] = value; /* the new last place */
    *n = *n + 1;        /* change the caller's count */
    return bigger;
}
