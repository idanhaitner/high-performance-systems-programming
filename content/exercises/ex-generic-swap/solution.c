#include <stddef.h>

void generic_swap(void *a, void *b, size_t size) {
    unsigned char *pa = a;
    unsigned char *pb = b;
    for (size_t i = 0; i < size; i++) {
        unsigned char temp = pa[i];
        pa[i] = pb[i];
        pb[i] = temp;
    }
}
