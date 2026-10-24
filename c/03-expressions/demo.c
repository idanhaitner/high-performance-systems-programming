// Lesson 3 — expressions.
// From the c folder:  make run LESSON=03-expressions

#include <stdio.h>

int main(void) {
    // Integer division drops the fraction. % gives the remainder.
    // To print a literal % sign, printf needs %%.
    printf("5 / 2 = %d\n", 5 / 2);
    printf("5 %% 2 = %d\n", 5 % 2);
    // Division cuts toward zero, and the remainder takes the sign of -5.
    printf("-5 / 2 = %d\n", -5 / 2);
    printf("-5 %% 2 = %d\n", -5 % 2);

    // = stores a value.
    int x = 0;
    x = 4;
    printf("after assignment, x = %d\n", x);
    // == compares and gives 1 (equal) or 0 (not equal).
    printf("3 == 4 is %d\n", 3 == 4);
    printf("4 == 4 is %d\n", 4 == 4);

    // n++ gives the old value, then adds one.
    int n = 3;
    int old = n++;
    printf("n++ gave %d, and n is now %d\n", old, n);

    // ++m adds one first, then gives the new value.
    int m = 3;
    int now = ++m;
    printf("++m gave %d, and m is now %d\n", now, m);

    return 0;
}
