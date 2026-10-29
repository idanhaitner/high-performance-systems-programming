#include <stdio.h>

int main(void) {
    int x;
    char ch;
    printf("Enter a number: ");
    scanf("%d", &x);
    printf("Enter a character: ");
    /* TODO: this reads the newline left over from pressing Enter.
       Make it skip spaces and newlines before reading the character. */
    scanf("%c", &ch);
    printf("x = %d, ch = '%c'\n", x, ch);
    return 0;
}
