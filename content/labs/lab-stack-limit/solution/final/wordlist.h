/* wordlist.h: a list of words that grows while the program runs.
   The list is a heap array of pointers, and each pointer holds the address
   of a word in its own heap block. */
#ifndef WORDLIST_H
#define WORDLIST_H

/* Returns a new heap block holding a copy of word, exactly strlen(word) + 1
   bytes, or NULL if there is no memory. */
char *copy_word(const char *word);

/* Adds a copy of word to the end of the caller's list, and adds 1 to *n.
   *list is the caller's list, and it is NULL when *n is 0.
   Returns 0 if it worked, or -1 if there is no memory (the list stays as it was). */
int add_word(char ***list, int *n, const char *word);

/* A rule for keeping a word: returns 1 if word has 5 letters or more, otherwise 0. */
int is_long(const char *word);

/* Returns how many of the n words make keep(word) return non-zero. */
int count_matching(char **list, int n, int (*keep)(const char *));

/* Prints each word that keep accepts, on its own line, in order. */
void print_matching(char **list, int n, int (*keep)(const char *));

/* Frees every word and then the list itself. */
void free_words(char **list, int n);

#endif
