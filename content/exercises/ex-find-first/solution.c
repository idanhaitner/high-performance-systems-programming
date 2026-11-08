#include <stddef.h>

int *find_first(int *a, int n, int target) {
    for (int *p = a; p < a + n; p++) {
        if (*p == target)
            return p; /* the address of the match */
    }
    return NULL; /* nothing matched */
}
