int main(void) {
    Point *p = make_points(3);
    CHECK("three points", p != NULL && p[0].x == 0 && p[0].y == 0 && p[1].x == 1 && p[1].y == 2 && p[2].x == 2 && p[2].y == 4,
          "make_points(3) should give (0, 0), (1, 2), (2, 4)%s", p == NULL ? ", but it returned NULL" : "");
    free(p);

    Point *q = make_points(1000);
    CHECK("many points", q != NULL && q[999].x == 999 && q[999].y == 1998 && q[500].y == 1000,
          "make_points(1000) should end with (999, 1998)%s", q == NULL ? ", but it returned NULL" : "");
    free(q);

    CHECK("zero points", make_points(0) == NULL, "make_points(0) should return NULL");
    return 0;
}
