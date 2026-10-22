// Lesson 6 — arrays and strings.
// From this directory:  make run LESSON=06-arrays-and-strings

#include <stdio.h>

int main(void) {
    int scores[4] = {10, 20, 30, 40};
    int sum = 0;
    for (int i = 0; i < 4; i = i + 1) {
        sum = sum + scores[i];
    }
    printf("sum of 4 scores = %d\n", sum);
    printf("last score = %d\n", scores[3]);

    char name[] = "Ada";
    int length = 0;
    while (name[length] != '\0') {
        length = length + 1;
    }
    printf("length of Ada = %d\n", length);
    printf("first letter = %c\n", name[0]);

    return 0;
}
