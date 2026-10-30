/* wordlist.c: the code of the functions declared in wordlist.h. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "wordlist.h"

char *copy_word(const char *word) {
    /* TODO: reserve strlen(word) + 1 bytes with malloc. If you get NULL, return
       NULL. Copy the word with strcpy, and return the new block. */
    (void)word;
    return NULL;
}

int add_word(char ***list, int *n, const char *word) {
    /* TODO:
       1. Make a copy of the word with copy_word. Return -1 if that fails.
       2. Grow the caller's list to *n + 1 pointers. *list is the caller's list.
          Keep realloc's answer in a second variable, bigger. If bigger is NULL,
          free the copy and return -1. The list stays valid.
       3. Store the copy at index *n of bigger.
       4. Change the caller's list and the caller's count through the pointers
          you received, and return 0. */
    (void)list;
    (void)n;
    (void)word;
    return -1;
}

int is_long(const char *word) {
    /* TODO: return 1 if the word has 5 letters or more, otherwise 0. */
    (void)word;
    return 0;
}

int count_matching(char **list, int n, int (*keep)(const char *)) {
    int count = 0;
    /* TODO: call keep on each word, and add 1 to count when it returns non-zero. */
    (void)list;
    (void)n;
    (void)keep;
    return count;
}

void print_matching(char **list, int n, int (*keep)(const char *)) {
    /* TODO: walk through the list with a pointer p, a char **, from list up to,
       but not including, list + n. *p is one word. Print it if keep accepts it. */
    (void)list;
    (void)n;
    (void)keep;
}

void free_words(char **list, int n) {
    /* TODO: free each word first, and the list itself last. */
    (void)list;
    (void)n;
}
