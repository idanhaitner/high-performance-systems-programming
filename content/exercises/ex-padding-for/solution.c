#include <stddef.h>

size_t padding_for(size_t offset, size_t alignment) {
    size_t remainder = offset % alignment;
    return remainder == 0 ? 0 : alignment - remainder;
}
