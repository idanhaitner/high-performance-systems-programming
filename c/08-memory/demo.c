// Lesson 8 — memory.
// From this directory:  make run LESSON=08-memory

#include <stdio.h>
#include <stdlib.h>

static int local_year(void) {
    int year = 2026;
    return year;
}

int main(void) {
    printf("local_year returned %d\n", local_year());

    int* boxed = malloc(sizeof(int));
    if (boxed == 0) {
        printf("malloc failed\n");
        return 1;
    }
    *boxed = 42;
    printf("heap value = %d\n", *boxed);
    free(boxed);

    printf("the heap int was released\n");
    return 0;
}
