#include <stdio.h>

int main(void) {
    int x;
    char ch;
    printf("Enter a number: ");
    scanf("%d", &x);
    printf("Enter a character: ");
    scanf(" %c", &ch); /* the space skips the leftover newline (and any spaces) */
    printf("x = %d, ch = '%c'\n", x, ch);
    return 0;
}
