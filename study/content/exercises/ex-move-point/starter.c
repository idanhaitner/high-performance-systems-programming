struct point {
    int x;
    int y;
};

/* Add dx to the x of the point that p points to. */
void move_right(struct point *p, int dx) {
    /* TODO: this changes only a copy. Change the point p points to. */
    struct point copy = *p;
    copy.x = copy.x + dx;
}
