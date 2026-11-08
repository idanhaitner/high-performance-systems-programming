int main(void) {
    Point *a = new_point(10, 20);
    CHECK("keeps both values", a != NULL && a->x == 10 && a->y == 20, "new_point(10, 20) should return the address of a Point with x 10 and y 20");

    Point *b = new_point(-1, 0);
    int separate = a != NULL && b != NULL && a != b;
    CHECK("a second point", separate && b->x == -1 && b->y == 0, "new_point(-1, 0) should return a different address, with x -1 and y 0");
    CHECK("the first point stays", separate && a->x == 10 && a->y == 20, "making a second point should not change the first one");

    if (separate) {
        free(a);
        free(b);
    }
    return 0;
}
