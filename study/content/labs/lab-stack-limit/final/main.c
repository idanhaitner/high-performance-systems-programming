/* main.c: reads words, one on each line, until the input ends. Then it prints
   how many it read, how many are long, and the long words themselves. */
#include <stdio.h>
#include <string.h>
#include "wordlist.h"

int main(void) {
    char **list = NULL;
    int n = 0;
    char line[100];

    /* TODO: read each line with fgets until it returns NULL. Remove the newline
       with strcspn, as in the lesson. Add the line to the list with add_word,
       passing the addresses of list and n. If add_word returns -1, free the
       list and return 1. */
    (void)line;

    printf("Read %d words\n", n);
    printf("Long words: %d\n", count_matching(list, n, is_long));
    print_matching(list, n, is_long);

    /* TODO: free everything. */
    return 0;
}
