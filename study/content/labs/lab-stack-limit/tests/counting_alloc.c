/* make final builds your code so that every malloc, realloc, calloc, and free
   goes through these functions. That is how it counts the blocks you still hold.
   You do not need to change this file. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static long blocks = 0;
static size_t last_size = 0;

void *counted_malloc(size_t size) {
    void *p = malloc(size);
    if (p != NULL) {
        blocks++;
        last_size = size;
    }
    return p;
}

void *counted_calloc(size_t count, size_t size) {
    void *p = calloc(count, size);
    if (p != NULL) {
        blocks++;
        last_size = count * size;
    }
    return p;
}

void *counted_realloc(void *old, size_t size) {
    void *p = realloc(old, size);
    if (p != NULL) {
        if (old == NULL)
            blocks++;
        last_size = size;
    }
    return p;
}

char *counted_strdup(const char *text) {
    char *p = counted_malloc(strlen(text) + 1);
    if (p != NULL)
        strcpy(p, text);
    return p;
}

void counted_free(void *p) {
    if (p != NULL)
        blocks--;
    free(p);
}

long blocks_in_use(void) {
    return blocks;
}

size_t last_block_size(void) {
    return last_size;
}

#ifdef REPORT_AT_EXIT
/* Runs by itself when the program ends. */
__attribute__((destructor)) static void report_blocks(void) {
    printf("Blocks never freed: %ld\n", blocks);
    fflush(stdout);
}
#endif
