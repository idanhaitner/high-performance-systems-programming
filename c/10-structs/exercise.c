// Lesson 10 exercises.
// Replace each not_implemented(...) call with your code.
// From this directory:  make try LESSON=10-structs
// A finished version is in solution.c. Try before you open it.

#include "check.h"

struct point {
    int x;
    int y;
};

struct point make_point(int x, int y) {
    // Return a point with these coordinates.
    not_implemented("make_point");
}

void point_move(struct point* p, int dx, int dy) {
    // Add dx to p->x and dy to p->y. p is not null.
    not_implemented("point_move");
}

struct point moved_copy(struct point p, int dx, int dy) {
    // Return a point shifted by dx and dy. Do not require the caller to change.
    not_implemented("moved_copy");
}

int same_point(struct point a, struct point b) {
    // Return 1 when a and b have the same coordinates, otherwise 0.
    not_implemented("same_point");
}

int point_bytes(void) {
    // Return how many bytes a struct point occupies on this machine.
    not_implemented("point_bytes");
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
