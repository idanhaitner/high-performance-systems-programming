#include <stddef.h>

#define ARENA_SIZE 64

static unsigned char arena[ARENA_SIZE];
static size_t next_offset = 0;

void *my_malloc(size_t size) {
    if (size == 0 || size > ARENA_SIZE - next_offset)
        return NULL;
    void *ptr = &arena[next_offset];
    next_offset += size;
    return ptr;
}
