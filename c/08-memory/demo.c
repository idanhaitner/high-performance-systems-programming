// Lesson 8 — memory.
// From the c folder:  make run LESSON=08-memory

#include <stdio.h>
#include <stdlib.h> // declares malloc and free

// year lives on the stack. Returning its value is safe; the value is copied.
static int local_year(void) {
    int year = 2026;
    return year;
}

int main(void) {
    printf("local_year returned %d\n", local_year());

    // Ask the heap for enough bytes to hold one int.
    int* boxed = malloc(sizeof(int));
    // malloc returns null when it cannot give memory.
    if (boxed == 0) {
        printf("malloc failed\n");
        return 1;
    }
    *boxed = 42;
    printf("heap value = %d\n", *boxed);
    // Give the block back. boxed must not be used after this line.
    free(boxed);

    printf("the heap int was released\n");
    return 0;
}
