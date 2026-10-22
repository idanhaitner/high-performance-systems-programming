// Lesson 7 — pointers.
// From this directory:  make run LESSON=07-pointers

#include <stdio.h>

int main(void) {
    int year = 2026;
    int* p = &year;

    printf("year = %d\n", year);
    printf("the pointer refers to %d\n", *p);

    *p = 2027;
    printf("after the write, year = %d\n", year);

    int* missing = 0;
    if (missing == 0) {
        printf("a null pointer was not dereferenced\n");
    }

    const int* view = &year;
    printf("const view reads %d\n", *view);

    return 0;
}
