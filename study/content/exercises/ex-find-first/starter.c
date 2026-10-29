#include <stddef.h> /* for NULL */

/* Return a pointer to the first element of a (n elements) equal to target,
   or NULL if there is none. */
int *find_first(int *a, int n, int target) {
    for (int *p = a; p < a + n; p++) {
        /* TODO: if the element p points to equals target, return p. */
    }
    return a; /* TODO: nothing matched, so return NULL instead */
}
