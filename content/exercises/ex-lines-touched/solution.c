#include <stddef.h>

size_t lines_touched(size_t addr, size_t bytes) {
    size_t first_line = addr / 64;
    size_t last_line = (addr + bytes - 1) / 64;
    return last_line - first_line + 1;
}
