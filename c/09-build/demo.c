// Lesson 9 — the build.
// From the c folder:  make run LESSON=09-build
// The real two-file example is in split/. Build and run it with:  make split

#include <stdio.h>

int main(void) {
    printf("One file is one translation unit.\n");
    printf("A header declares. A .c file defines.\n");
    printf("The linker joins the definitions the compiler left as names.\n");
    return 0;
}
