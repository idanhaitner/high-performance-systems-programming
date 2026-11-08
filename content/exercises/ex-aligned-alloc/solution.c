#include <stddef.h>

#define ARENA_SIZE 64
#define ALIGNMENT 8

static _Alignas(max_align_t) unsigned char arena[ARENA_SIZE];
static size_t next_offset = 0;

void *my_malloc(size_t size) {
    if (size == 0)
        return NULL;
    size_t remainder = next_offset % ALIGNMENT;
    size_t padding = remainder == 0 ? 0 : ALIGNMENT - remainder;
    if (padding > ARENA_SIZE - next_offset)
        return NULL;
    size_t aligned = next_offset + padding;
    if (size > ARENA_SIZE - aligned)
        return NULL;
    void *ptr = &arena[aligned];
    next_offset = aligned + size;
    return ptr;
}
