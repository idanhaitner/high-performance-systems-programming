#ifndef BLOCKS_H
#define BLOCKS_H

#include <stddef.h>

size_t round_up(size_t offset, size_t align);
size_t struct_size(const size_t *sizes, int count);
size_t lines_touched(size_t addr, size_t bytes);
void transpose_blocked(int n, int bs, const double *in, double *out);

#endif
