#ifndef WORDLIST_H
#define WORDLIST_H

char *copy_word(const char *word);
int add_word(char ***list, int *n, const char *word);
int is_long(const char *word);
int count_matching(char **list, int n, int (*keep)(const char *));
void print_matching(char **list, int n, int (*keep)(const char *));
void free_words(char **list, int n);

#endif
