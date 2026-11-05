typedef struct {
    int x, y, z;
} Point;

void split_points(const Point *p, int n, int *x, int *y, int *z) {
    for (int i = 0; i < n; i++) {
        x[i] = p[i].x;
        y[i] = p[i].y;
        z[i] = p[i].z;
    }
}
