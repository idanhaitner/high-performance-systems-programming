#include <stdlib.h>

typedef struct {
    int x;
    int y;
} Point;

Point *new_point(int x, int y) {
    Point *p = malloc(sizeof(*p));
    if (p == NULL)
        return NULL;
    p->x = x;
    p->y = y;
    return p;
}
