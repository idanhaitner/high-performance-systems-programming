// Finished lesson 10. Write yours in exercise.c first.

#include "check.h"

struct point {
    int x;
    int y;
};

// The struct is returned by value: the caller gets a copy of p.
struct point make_point(int x, int y) {
    struct point p;
    p.x = x;
    p.y = y;
    return p;
}

// p points at the caller's struct, so -> changes the caller's fields.
void point_move(struct point* p, int dx, int dy) {
    p->x = p->x + dx;
    p->y = p->y + dy;
}

// p is a copy of the argument. Changing it leaves the caller's point
// alone, and the changed copy is returned.
struct point moved_copy(struct point p, int dx, int dy) {
    p.x = p.x + dx;
    p.y = p.y + dy;
    return p;
}

// C cannot compare two structs with ==. Compare the fields one by one.
int same_point(struct point a, struct point b) {
    return a.x == b.x && a.y == b.y;
}

int point_bytes(void) {
    return (int)sizeof(struct point);
}

static void test_x(void) {
    struct point p = make_point(2, 5);
    expect_int(p.x, 2);
}

static void test_y(void) {
    struct point p = make_point(2, 5);
    expect_int(p.y, 5);
}

static void test_move(void) {
    struct point p = make_point(2, 5);
    point_move(&p, 1, -2);
    expect_int(p.x, 3);
    expect_int(p.y, 3);
}

static void test_copy(void) {
    struct point p = make_point(2, 5);
    struct point q = moved_copy(p, 1, 0);
    expect_int(p.x, 2);
    expect_int(q.x, 3);
}

static void test_same(void) {
    expect_int(same_point(make_point(1, 2), make_point(1, 2)), 1);
}

static void test_different(void) {
    expect_int(same_point(make_point(1, 2), make_point(1, 3)), 0);
}

static void test_bytes(void) {
    expect_int(point_bytes(), (int)sizeof(struct point));
}

int main(void) {
    Score score = {0};
    task(&score, "make_point(2, 5) has x 2", test_x);
    task(&score, "make_point(2, 5) has y 5", test_y);
    task(&score, "point_move adds the deltas", test_move);
    task(&score, "moved_copy leaves the argument", test_copy);
    task(&score, "same_point matches equal points", test_same);
    task(&score, "same_point rejects a different y", test_different);
    task(&score, "point_bytes() is sizeof(struct point)", test_bytes);
    return score_finish(&score);
}
