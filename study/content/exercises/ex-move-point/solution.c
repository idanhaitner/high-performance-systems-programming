struct point {
    int x;
    int y;
};

/* Add dx to the x of the point that p points to. */
void move_right(struct point *p, int dx) {
    p->x = p->x + dx;
}
