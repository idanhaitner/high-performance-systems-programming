#include <stdlib.h>

int *make_box(int value) {
    int *box = malloc(sizeof(int));
    if (box == NULL)
        return NULL;
    *box = value;
    return box;
}
