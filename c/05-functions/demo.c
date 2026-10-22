// Lesson 5 — functions.
// From this directory:  make run LESSON=05-functions

#include <stdio.h>

static int plus_one(int n) {
    n = n + 1;
    return n;
}

static int twice(int n) {
    return n * 2;
}

static int four_times(int n) {
    return twice(twice(n));
}

int main(void) {
    int year = 2026;
    int next = plus_one(year);
    printf("plus_one returned %d\n", next);
    printf("year is still %d\n", year);
    printf("four_times(3) = %d\n", four_times(3));
    return 0;
}
