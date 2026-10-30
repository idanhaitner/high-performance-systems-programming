#include <stddef.h> /* NULL */

/* Make the caller's pointer NULL. pp holds the address of that pointer. */
void clear_pointer(int **pp) {
    *pp = NULL;
}
