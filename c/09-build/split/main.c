// Calls functions defined in mathx.c. The header gives the compiler their
// declarations; the linker connects the calls to the definitions.
// From the c folder:  make split

#include <stdio.h>

#include "mathx.h"

int main(void) {
    printf("add(2, 3) = %d\n", add(2, 3));
    printf("sub(10, 4) = %d\n", sub(10, 4));
    return 0;
}
