#include <stdlib.h> /* malloc */

/* Return the address of a new int holding value, or NULL if there is no memory.
   The int must stay alive after this function returns. The caller frees it. */
int *make_box(int value) {
    /* TODO: x is destroyed when this function returns.
       Keep the value in a heap block instead. */
    int x = value;
    return &x;
}
