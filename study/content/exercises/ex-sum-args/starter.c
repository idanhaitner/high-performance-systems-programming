#include <stdio.h>
#include <stdlib.h>

/* Print the sum of all the numbers typed after the program's name. */
int main(int argc, char *argv[]) {
    int sum = 0;

    /* TODO: this adds only the first number. Add every number,
       from argv[1] up to argv[argc - 1]. */
    if (argc > 1) {
        sum = atoi(argv[1]);
    }

    printf("%d\n", sum);
    return 0;
}
