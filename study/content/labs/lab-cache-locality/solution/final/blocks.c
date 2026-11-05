#include "blocks.h"

size_t round_up(size_t offset, size_t align) {
    return (offset + align - 1) / align * align;
}

size_t struct_size(const size_t *sizes, int count) {
    size_t offset = 0;
    size_t biggest = 1;
    for (int i = 0; i < count; i++) {
        offset = round_up(offset, sizes[i]);
        offset += sizes[i];
        if (sizes[i] > biggest)
            biggest = sizes[i];
    }
    return round_up(offset, biggest);
}

size_t lines_touched(size_t addr, size_t bytes) {
    size_t first_line = addr / 64;
    size_t last_line = (addr + bytes - 1) / 64;
    return last_line - first_line + 1;
}

void transpose_blocked(int n, int bs, const double *in, double *out) {
    for (int ii = 0; ii < n; ii += bs)
        for (int jj = 0; jj < n; jj += bs)
            for (int i = ii; i < ii + bs && i < n; i++)
                for (int j = jj; j < jj + bs && j < n; j++)
                    out[j * n + i] = in[i * n + j];
}
