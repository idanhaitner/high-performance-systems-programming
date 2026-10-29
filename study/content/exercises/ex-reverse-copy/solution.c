#include <stdlib.h> /* malloc */

/* Return a new heap array of n ints holding a in reverse order.
   a itself does not change. The caller frees the result. */
int *reverse_copy(int *a, int n) {
    int *r = malloc(n * sizeof(int)); /* on the heap, so it outlives this function */
    if (r == NULL)
        return NULL;
    for (int i = 0; i < n; i++)
        r[i] = a[n - 1 - i]; /* element i comes from the other end */
    return r;
}
