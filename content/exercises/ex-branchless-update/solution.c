#include <stddef.h>
#include <stdint.h>

void update(const uint32_t *a, uint32_t *b, size_t n) {
    for (size_t i = 0; i < n; ++i)
        b[i] += (a[i] > UINT32_MAX / 2) ? a[i] : -a[i];
}
