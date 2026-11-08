/* main.c: reads words, one on each line, until the input ends. Then it prints
   how many it read, how many are long, and the long words themselves. */
#include <stdio.h>
#include <string.h>
#include "wordlist.h"

int main(void) {
    char **list = NULL;
    int n = 0;
    char line[100];

    while (fgets(line, sizeof(line), stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        if (add_word(&list, &n, line) == -1) {
            free_words(list, n);
            return 1;
        }
    }

    printf("Read %d words\n", n);
    printf("Long words: %d\n", count_matching(list, n, is_long));
    print_matching(list, n, is_long);

    free_words(list, n);
    return 0;
}
