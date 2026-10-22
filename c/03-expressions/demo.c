// Lesson 3 — expressions.
// From this directory:  make run LESSON=03-expressions

#include <stdio.h>

int main(void) {
    printf("5 / 2 = %d\n", 5 / 2);
    printf("5 %% 2 = %d\n", 5 % 2);
    printf("-5 / 2 = %d\n", -5 / 2);
    printf("-5 %% 2 = %d\n", -5 % 2);

    int x = 0;
    x = 4;
    printf("after assignment, x = %d\n", x);
    printf("3 == 4 is %d\n", 3 == 4);
    printf("4 == 4 is %d\n", 4 == 4);

    int n = 3;
    int old = n++;
    printf("post-increment yielded %d and n is now %d\n", old, n);

    int m = 3;
    int now = ++m;
    printf("pre-increment yielded %d and m is now %d\n", now, m);

    return 0;
}
