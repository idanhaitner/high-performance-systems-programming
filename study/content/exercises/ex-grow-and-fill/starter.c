#include <stdlib.h> /* realloc */

/* a holds old_n ints on the heap. Grow it to new_n ints, and store fill
   in each new place. Return the new address, or NULL if realloc fails. */
int *grow_and_fill(int *a, int old_n, int new_n, int fill) {
    /* TODO 1: if realloc fails, this line loses the old address.
       Keep the answer in a second variable, and return NULL if it is NULL.
       TODO 2: store fill in the new places. */
    (void)old_n;
    (void)fill;
    a = realloc(a, new_n * sizeof(int));
    return a;
}
