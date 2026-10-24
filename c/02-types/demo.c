// Lesson 2 — types.
// From the c folder:  make run LESSON=02-types

#include <stdio.h>
#include <stdbool.h> // defines bool, true, and false

int main(void) {
    // sizeof gives a size_t, so print it with %zu.
    printf("sizeof(char) = %zu\n", sizeof(char));
    printf("sizeof(int) = %zu\n", sizeof(int));
    printf("sizeof(double) = %zu\n", sizeof(double));
    printf("sizeof(bool) = %zu\n", sizeof(bool));
    printf("sizeof(void*) = %zu\n", sizeof(void*));

    // == gives the int 1 when the two sides are equal, otherwise 0.
    printf("sizeof(int) == sizeof(unsigned) is %d\n",
           sizeof(int) == sizeof(unsigned));

    // A bool printed as a number shows 1 for true and 0 for false.
    bool ready = true;
    printf("true is %d\n", ready);

    // The same char printed as a character (%c) and as a number (%d).
    char letter = 'A';
    printf("letter %c is code %d\n", letter, letter);

    return 0;
}
