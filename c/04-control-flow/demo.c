// Lesson 4 — control flow.
// From this directory:  make run LESSON=04-control-flow

#include <stdio.h>

int main(void) {
    int n = -3;
    if (n > 0) {
        printf("sign of -3 is 1\n");
    } else if (n < 0) {
        printf("sign of -3 is -1\n");
    } else {
        printf("sign of -3 is 0\n");
    }

    int sum = 0;
    int i = 0;
    while (i < 4) {
        sum = sum + i;
        i = i + 1;
    }
    printf("sum below 4 = %d\n", sum);

    int product = 1;
    for (int k = 1; k <= 4; k = k + 1) {
        product = product * k;
    }
    printf("product of 1..4 = %d\n", product);

    int code = 1;
    switch (code) {
    case 0:
        printf("label is zero\n");
        break;
    case 1:
        printf("label is one\n");
        break;
    default:
        printf("label is other\n");
        break;
    }

    return 0;
}
