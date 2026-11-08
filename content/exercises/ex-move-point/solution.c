struct point {
    int x;
    int y;
};

void move_right(struct point *p, int dx) {
    p->x = p->x + dx;
}
