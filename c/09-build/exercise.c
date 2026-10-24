// Lesson 9 exercises.
// Replace each not_implemented(...) call with your code.
// These are definitions a .c file would hold. A header would declare them.
// From the c folder:  make try LESSON=09-build
// A finished version is in solution.c. Try before you open it.

#include "check.h"

int rectangle_area(int w, int h) {
    // Return the area of a w by h rectangle.
    return w * h;
}

int rectangle_perimeter(int w, int h) {
    // Return the perimeter of a w by h rectangle.
    return 2 * (w + h);
}

int scale(int n, int factor) {
    // Return n multiplied by factor.
    return n * factor;
}

int in_range(int n, int lo, int hi) {
    // Return 1 when lo <= n <= hi, otherwise 0. lo is less than or equal to hi.
    // C cannot chain comparisons: write two of them joined by && ("and").
    return n >= lo && n <= hi;
}

static void test_area(void) {
    expect_int(rectangle_area(3, 4), 12);
}

static void test_area_zero(void) {
    expect_int(rectangle_area(0, 5), 0);
}

static void test_perimeter(void) {
    expect_int(rectangle_perimeter(3, 4), 14);
}

static void test_scale(void) {
    expect_int(scale(6, 3), 18);
}

static void test_scale_zero(void) {
    expect_int(scale(6, 0), 0);
}

static void test_inside(void) {
    expect_int(in_range(3, 0, 5), 1);
}

static void test_outside(void) {
    expect_int(in_range(6, 0, 5), 0);
}

static void test_edge(void) {
    expect_int(in_range(0, 0, 5), 1);
}

int main(void) {
    Score score = {0};
    task(&score, "rectangle_area(3, 4) is 12", test_area);
    task(&score, "rectangle_area(0, 5) is 0", test_area_zero);
    task(&score, "rectangle_perimeter(3, 4) is 14", test_perimeter);
    task(&score, "scale(6, 3) is 18", test_scale);
    task(&score, "scale(6, 0) is 0", test_scale_zero);
    task(&score, "in_range(3, 0, 5) is 1", test_inside);
    task(&score, "in_range(6, 0, 5) is 0", test_outside);
    task(&score, "in_range(0, 0, 5) is 1", test_edge);
    return score_finish(&score);
}
