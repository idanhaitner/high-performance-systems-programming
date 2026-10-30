#include <stdlib.h>

int *make_zeros(int n) {
    return calloc(n, sizeof(int));
}
