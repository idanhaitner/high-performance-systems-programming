// Lesson 6 — arrays and strings.
// From the c folder:  make run LESSON=06-arrays-and-strings

#include <stdio.h>

int main(void) {
    // Four ints in a row. Valid indexes are 0, 1, 2, 3.
    int scores[4] = {10, 20, 30, 40};
    int sum = 0;
    // i < 4, not i <= 4: index 4 is past the end.
    for (int i = 0; i < 4; i = i + 1) {
        sum = sum + scores[i];
    }
    printf("sum of 4 scores = %d\n", sum);
    printf("last score = %d\n", scores[3]);

    // "Ada" is stored as 'A', 'd', 'a', '\0'. The '\0' marks the end.
    char name[] = "Ada";
    // Count characters until the terminator.
    int length = 0;
    while (name[length] != '\0') {
        length = length + 1;
    }
    printf("length of Ada = %d\n", length);
    printf("first letter = %c\n", name[0]);

    return 0;
}
