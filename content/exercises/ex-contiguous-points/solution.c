#include <stdlib.h>

typedef struct {
    int x, y;
} Point;

Point *make_points(int n) {
    if (n <= 0)
        return NULL;
    Point *pts = malloc(n * sizeof(*pts));
    if (pts == NULL)
        return NULL;
    for (int i = 0; i < n; i++) {
        pts[i].x = i;
        pts[i].y = 2 * i;
    }
    return pts;
}
