#include <stdlib.h> /* realloc */

/* a holds old_n ints on the heap. Grow it to new_n ints, and store fill
   in each new place. Return the new address, or NULL if realloc fails. */
int *grow_and_fill(int *a, int old_n, int new_n, int fill) {
    int *bigger = realloc(a, new_n * sizeof(int));
    if (bigger == NULL)
        return NULL; /* a is still valid, and the caller still has it */
    for (int i = old_n; i < new_n; i++)
        bigger[i] = fill;
    return bigger;
}
