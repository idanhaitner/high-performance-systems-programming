#include <stdlib.h> /* malloc */

/* Return a new heap array of n ints holding a in reverse order.
   a itself does not change. The caller frees the result. */
int *reverse_copy(int *a, int n) {
    /* TODO: this array lives on the stack and is destroyed when we return.
       Make it with malloc instead, then fill it and return it. */
    int r[n];
    for (int i = 0; i < n; i++)
        r[i] = a[i]; /* TODO: copy from the other end of a */
    (void)r;
    return NULL;
}
