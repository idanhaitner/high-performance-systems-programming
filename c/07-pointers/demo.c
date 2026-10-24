// Lesson 7 — pointers.
// From the c folder:  make run LESSON=07-pointers

#include <stdio.h>

int main(void) {
    int year = 2026;
    // p holds the address of year. &year is "the address of year".
    int* p = &year;

    printf("year = %d\n", year);
    // *p follows the address: it is year itself.
    printf("the pointer refers to %d\n", *p);

    // Writing through p changes year.
    *p = 2027;
    printf("after the write, year = %d\n", year);

    // 0 is the null pointer: it points at nothing. Check before using it.
    int* missing = 0;
    if (missing == 0) {
        printf("a null pointer was not dereferenced\n");
    }

    // Through a const int*, year can be read but not changed.
    const int* view = &year;
    printf("const view reads %d\n", *view);

    return 0;
}
