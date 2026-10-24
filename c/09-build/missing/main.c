// This program does not link, on purpose. See "A missing definition" in
// 09-build/lesson.md. From the c folder:  make link-error

#include <stdio.h>

// A declaration: it promises that a function named missing exists.
// No .c file defines it, so the linker cannot find it.
int missing(void);

int main(void) {
    printf("missing() = %d\n", missing());
    return 0;
}
