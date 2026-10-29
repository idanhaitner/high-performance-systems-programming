#include <stdlib.h> /* realloc */

/* a holds *n ints on the heap (a may be NULL when *n is 0).
   Grow it by one int, store value at the end, add 1 to *n,
   and return the array's address, which may have moved. */
int *append(int *a, int *n, int value) {
    int *bigger = realloc(a, (*n + 1) * sizeof(int));
    if (bigger == NULL)
        return a; /* the old block is still valid and unchanged */
    bigger[*n] = value; /* the new last place */
    *n = *n + 1;        /* change the caller's count */
    return bigger;
}
