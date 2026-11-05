#include <stddef.h>

size_t cache_offset(size_t addr) {
    return addr % 64;
}

size_t cache_set(size_t addr) {
    return (addr / 64) % 16;
}

size_t cache_tag(size_t addr) {
    return addr / (64 * 16);
}
