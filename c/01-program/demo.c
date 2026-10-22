// Lesson 1 — a program.
// From this directory:  make run LESSON=01-program

#include <stdio.h>

int main(void) {
    printf("A C program starts in main.\n");

    int year = 2026;
    printf("year = %d\n", year);

    year = year + 1;
    printf("after adding 1, year = %d\n", year);

    return 0;
}
