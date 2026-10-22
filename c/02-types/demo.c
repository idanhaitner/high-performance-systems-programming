// Lesson 2 — types.
// From this directory:  make run LESSON=02-types

#include <stdio.h>
#include <stdbool.h>

int main(void) {
    printf("sizeof(char) = %zu\n", sizeof(char));
    printf("sizeof(int) = %zu\n", sizeof(int));
    printf("sizeof(double) = %zu\n", sizeof(double));
    printf("sizeof(void*) = %zu\n", sizeof(void*));
    printf("sizeof(int) == sizeof(unsigned) is %d\n",
           sizeof(int) == sizeof(unsigned));

    bool ready = true;
    printf("true is %d\n", ready);

    char letter = 'A';
    printf("letter %c is code %d\n", letter, letter);

    return 0;
}
