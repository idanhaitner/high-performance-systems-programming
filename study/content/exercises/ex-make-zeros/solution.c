#include <stdlib.h> /* calloc */

/* Return a new heap block of n ints, all 0. The caller frees it. */
int *make_zeros(int n) {
    return calloc(n, sizeof(int));
}
