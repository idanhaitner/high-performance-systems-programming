// Lesson 4 — control flow.
// From the c folder:  make run LESSON=04-control-flow

#include <stdio.h>

int main(void) {
    // if / else if / else: only the first true branch runs.
    int n = -3;
    if (n > 0) {
        printf("sign of %d is 1\n", n);
    } else if (n < 0) {
        printf("sign of %d is -1\n", n);
    } else {
        printf("sign of %d is 0\n", n);
    }

    // while: add 0 + 1 + 2 + 3. The loop stops when i reaches 4.
    int sum = 0;
    int i = 0;
    while (i < 4) {
        sum = sum + i;
        i = i + 1;
    }
    printf("sum below 4 = %d\n", sum);

    // for: multiply 1 * 2 * 3 * 4. k exists only inside the loop.
    int product = 1;
    for (int k = 1; k <= 4; k = k + 1) {
        product = product * k;
    }
    printf("product of 1..4 = %d\n", product);

    // switch: jump to the matching case. break stops it from running
    // into the next case.
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
