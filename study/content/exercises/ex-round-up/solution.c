#include <stddef.h>

size_t round_up(size_t offset, size_t align) {
    return (offset + align - 1) / align * align;
}
