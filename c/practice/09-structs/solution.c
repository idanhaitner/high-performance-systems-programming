// Practice 09: structs. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=09-structs

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
    double dx = b.x - a.x;
    double dy = b.y - a.y;
    return sqrt(dx * dx + dy * dy);
}

Point midpoint(Point a, Point b) {
    // Return the point halfway between a and b.
    // A struct can be built and returned like any other value.
    Point m = {(a.x + b.x) / 2, (a.y + b.y) / 2};
    return m;
}

int rect_area(Rect r) {
    // Return the area of r.
    return r.width * r.height;
}

bool rect_contains(Rect r, int px, int py) {
    // Return true when the point (px, py) is inside r or on its border.
    return px >= r.x && px <= r.x + r.width &&
           py >= r.y && py <= r.y + r.height;
}

void rect_move(Rect* r, int dx, int dy) {
    // Move r by dx to the right and dy up. r is a pointer, so the
    // caller's Rect changes. Hint: r->x means (*r).x.
    r->x += dx;
    r->y += dy;
}

Fraction simplify(Fraction f) {
    // Return f in lowest terms, with a positive den.
    // 6/8 becomes 3/4. 3/-6 becomes -1/2. 0/5 becomes 0/1.
    // Euclid's gcd from practice 04, on the sizes of the numbers.
    int a = f.num < 0 ? -f.num : f.num;
    int b = f.den < 0 ? -f.den : f.den;
    while (b != 0) {
        int rest = a % b;
        a = b;
        b = rest;
    }
    // Here a is the gcd. It is 0 only when num is 0.
    if (a == 0) {
        Fraction zero = {0, 1};
        return zero;
    }
    Fraction out = {f.num / a, f.den / a};
    // Move a minus sign from the bottom to the top.
    if (out.den < 0) {
        out.num = -out.num;
        out.den = -out.den;
    }
    return out;
}

Fraction add_fractions(Fraction a, Fraction b) {
    // Return a + b, simplified. 1/2 + 1/3 is 5/6. 1/4 + 1/4 is 1/2.
    // a/b + c/d = (a*d + c*b) / (b*d), then simplify.
    Fraction sum = {a.num * b.den + b.num * a.den, a.den * b.den};
    return simplify(sum);
}

Time add_minutes(Time t, int minutes) {
    // minutes is 0 or more. Return the time minutes later, on a 24-hour
    // clock. 23:50 plus 20 minutes is 00:10.
    // Work in minutes since midnight, then split back into hours and
    // minutes. % (24 * 60) wraps past midnight.
    int total = (t.hours * 60 + t.minutes + minutes) % (24 * 60);
    Time out = {total / 60, total % 60};
    return out;
}

double student_average(const Student* s) {
    // Return the average of the student's three grades.
    int sum = 0;
    for (int i = 0; i < 3; i++) {
        sum += s->grades[i];
    }
    return sum / 3.0;
}

int best_student(const Student students[], int n) {
    // n is at least 1. Return the position of the student with the
    // highest average (the first one, if there is a tie).
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (student_average(&students[i]) > student_average(&students[best])) {
            best = i;
        }
    }
    return best;
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
