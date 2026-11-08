/* wordlist.c: the code of the functions declared in wordlist.h. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "wordlist.h"

char *copy_word(const char *word) {
    char *copy = malloc(strlen(word) + 1); /* + 1 for the '\0' */
    if (copy == NULL)
        return NULL;
    strcpy(copy, word);
    return copy;
}

int add_word(char ***list, int *n, const char *word) {
    char *copy = copy_word(word);
    if (copy == NULL)
        return -1;
    char **bigger = realloc(*list, (*n + 1) * sizeof(char *));
    if (bigger == NULL) {
        free(copy);
        return -1; /* *list is still valid */
    }
    bigger[*n] = copy;
    *list = bigger;
    *n = *n + 1;
    return 0;
}

int is_long(const char *word) {
    return strlen(word) >= 5;
}

int count_matching(char **list, int n, int (*keep)(const char *)) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (keep(list[i]))
            count = count + 1;
    }
    return count;
}

void print_matching(char **list, int n, int (*keep)(const char *)) {
    for (char **p = list; p < list + n; p++) {
        if (keep(*p))
            printf("%s\n", *p);
    }
}

void free_words(char **list, int n) {
    for (int i = 0; i < n; i++)
        free(list[i]);
    free(list);
}
