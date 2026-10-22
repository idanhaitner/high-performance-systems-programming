// Lesson 9 — the build.
// From this directory:  make run LESSON=09-build

#include <stdio.h>

int main(void) {
    printf("One file is one translation unit.\n");
    printf("A header declares. A .c file defines.\n");
    printf("The linker joins the definitions the compiler left as names.\n");
    return 0;
}
