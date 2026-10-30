#include <stdlib.h> /* malloc */

/* Return the address of a new int holding value, or NULL if there is no memory.
   The int must stay alive after this function returns. The caller frees it. */
int *make_box(int value) {
    int *box = malloc(sizeof(int));
    if (box == NULL)
        return NULL;
    *box = value;
    return box;
}
