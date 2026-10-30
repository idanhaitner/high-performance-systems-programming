int main(void) {
    struct point a = {1, 2};
    move_right(&a, 5);
    CHECK("moves right", a.x == 6, "a.x started at 1 and moved by 5, so it should be 6, but it is %d", a.x);

    struct point b = {10, 0};
    move_right(&b, -4);
    CHECK("moves left", b.x == 6, "b.x started at 10 and moved by -4, so it should be 6, but it is %d", b.x);

    struct point c = {0, 7};
    move_right(&c, 3);
    CHECK("y stays", c.y == 7, "only x should change, so c.y should still be 7, but it is %d", c.y);
    return 0;
}
