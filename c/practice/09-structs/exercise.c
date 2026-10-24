// Practice 09: structs.
// A struct groups several values under one name. The types are given;
// write the functions that use them.
// From the c folder:  make practice LEVEL=09-structs
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

typedef struct {
    double x;
    double y;
} Point;

typedef struct {
    int x;       // left edge
    int y;       // bottom edge
    int width;
    int height;
} Rect;

typedef struct {
    int num;     // the number on top
    int den;     // the number below, never 0
} Fraction;

typedef struct {
    int hours;   // 0 to 23
    int minutes; // 0 to 59
} Time;

typedef struct {
    char name[32];
    int grades[3];
} Student;

double distance(Point a, Point b) {
    // Return the straight-line distance between a and b.
    // distance from (0, 0) to (3, 4) is 5. Hint: sqrt from <math.h>.
    not_implemented("distance");
}

Point midpoint(Point a, Point b) {
    // Return the point halfway between a and b.
    not_implemented("midpoint");
}

int rect_area(Rect r) {
    // Return the area of r.
    not_implemented("rect_area");
}

bool rect_contains(Rect r, int px, int py) {
    // Return true when the point (px, py) is inside r or on its border.
    not_implemented("rect_contains");
}

void rect_move(Rect* r, int dx, int dy) {
    // Move r by dx to the right and dy up. r is a pointer, so the
    // caller's Rect changes. Hint: r->x means (*r).x.
    not_implemented("rect_move");
}

Fraction simplify(Fraction f) {
    // Return f in lowest terms, with a positive den.
    // 6/8 becomes 3/4. 3/-6 becomes -1/2. 0/5 becomes 0/1.
    not_implemented("simplify");
}

Fraction add_fractions(Fraction a, Fraction b) {
    // Return a + b, simplified. 1/2 + 1/3 is 5/6. 1/4 + 1/4 is 1/2.
    not_implemented("add_fractions");
}

Time add_minutes(Time t, int minutes) {
    // minutes is 0 or more. Return the time minutes later, on a 24-hour
    // clock. 23:50 plus 20 minutes is 00:10.
    not_implemented("add_minutes");
}

double student_average(const Student* s) {
    // Return the average of the student's three grades.
    not_implemented("student_average");
}

int best_student(const Student students[], int n) {
    // n is at least 1. Return the position of the student with the
    // highest average (the first one, if there is a tie).
    not_implemented("best_student");
}

static void test_distance(void) {
    Point a = {0, 0};
    Point b = {3, 4};
    expect_double(distance(a, b), 5);
    expect_double(distance(b, b), 0);
}

static void test_midpoint(void) {
    Point a = {0, 0};
    Point b = {4, -2};
    Point m = midpoint(a, b);
    expect_double(m.x, 2);
    expect_double(m.y, -1);
}

static void test_rect(void) {
    Rect r = {1, 1, 4, 3};
    expect_int(rect_area(r), 12);
    expect_true(rect_contains(r, 2, 2), "(2, 2) is inside");
    expect_true(rect_contains(r, 5, 4), "(5, 4) is on the corner");
    expect_true(!rect_contains(r, 0, 2), "(0, 2) is outside");
    expect_true(!rect_contains(r, 2, 5), "(2, 5) is outside");
}

static void test_move(void) {
    Rect r = {1, 1, 4, 3};
    rect_move(&r, 2, -1);
    expect_int(r.x, 3);
    expect_int(r.y, 0);
    expect_int(r.width, 4);
}

static void test_simplify(void) {
    Fraction a = simplify((Fraction){6, 8});
    Fraction b = simplify((Fraction){3, -6});
    Fraction c = simplify((Fraction){0, 5});
    expect_int(a.num, 3);
    expect_int(a.den, 4);
    expect_int(b.num, -1);
    expect_int(b.den, 2);
    expect_int(c.num, 0);
    expect_int(c.den, 1);
}

static void test_add_fractions(void) {
    Fraction a = add_fractions((Fraction){1, 2}, (Fraction){1, 3});
    Fraction b = add_fractions((Fraction){1, 4}, (Fraction){1, 4});
    expect_int(a.num, 5);
    expect_int(a.den, 6);
    expect_int(b.num, 1);
    expect_int(b.den, 2);
}

static void test_time(void) {
    Time a = add_minutes((Time){23, 50}, 20);
    Time b = add_minutes((Time){9, 15}, 135);
    expect_int(a.hours, 0);
    expect_int(a.minutes, 10);
    expect_int(b.hours, 11);
    expect_int(b.minutes, 30);
}

static void test_students(void) {
    Student s[] = {
        {"Noa", {80, 90, 70}},
        {"Idan", {95, 85, 90}},
        {"Tal", {100, 60, 80}},
    };
    expect_double(student_average(&s[0]), 80);
    expect_int(best_student(s, 3), 1);
}

int main(void) {
    Score score = {0};
    task(&score, "distance", test_distance);
    task(&score, "midpoint", test_midpoint);
    task(&score, "rect_area and rect_contains", test_rect);
    task(&score, "rect_move", test_move);
    task(&score, "simplify", test_simplify);
    task(&score, "add_fractions", test_add_fractions);
    task(&score, "add_minutes", test_time);
    task(&score, "student_average and best_student", test_students);
    return score_finish(&score);
}
