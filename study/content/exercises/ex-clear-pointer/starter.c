#include <stddef.h> /* NULL */

/* Make the caller's pointer NULL. pp holds the address of that pointer. */
void clear_pointer(int **pp) {
    /* TODO: this changes only pp, the function's copy of the address.
       Change the caller's pointer instead. */
    pp = NULL;
}
