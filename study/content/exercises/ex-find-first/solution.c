#include <stddef.h> /* for NULL */

/* Return a pointer to the first element of a (n elements) equal to target,
   or NULL if there is none. */
int *find_first(int *a, int n, int target) {
    for (int *p = a; p < a + n; p++) {
        if (*p == target)
            return p; /* the address of the match */
    }
    return NULL; /* nothing matched */
}
