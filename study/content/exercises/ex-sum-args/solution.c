#include <stdio.h>
#include <stdlib.h>

/* Print the sum of all the numbers typed after the program's name. */
int main(int argc, char *argv[]) {
    int sum = 0;

    for (int i = 1; i < argc; i++) { /* start at 1: argv[0] is the program's name */
        sum = sum + atoi(argv[i]);   /* "3" becomes 3, then it is added */
    }

    printf("%d\n", sum);
    return 0;
}
