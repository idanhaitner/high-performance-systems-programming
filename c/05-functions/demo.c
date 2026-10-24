// Lesson 5 — functions.
// From the c folder:  make run LESSON=05-functions

#include <stdio.h>

// static means: used only in this file.

// n is a copy of the caller's argument. Changing n does not change the
// caller's variable.
static int plus_one(int n) {
    n = n + 1;
    return n;
}

static int twice(int n) {
    return n * 2;
}

// A function can call another function. twice is defined above, so the
// compiler already knows it here.
static int four_times(int n) {
    return twice(twice(n));
}

int main(void) {
    int year = 2026;
    int next = plus_one(year); // year is copied into plus_one's n
    printf("plus_one returned %d\n", next);
    printf("year is still %d\n", year);
    printf("four_times(3) = %d\n", four_times(3));
    return 0;
}
