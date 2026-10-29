#include <stdlib.h> /* realloc */

/* a holds *n ints on the heap (a may be NULL when *n is 0).
   Grow it by one int, store value at the end, add 1 to *n,
   and return the array's address, which may have moved. */
int *append(int *a, int *n, int value) {
    /* TODO: grow the block to *n + 1 ints with realloc.
       Then store value at index *n, add 1 to *n, and return the new address. */
    (void)n;
    (void)value;
    return a;
}
