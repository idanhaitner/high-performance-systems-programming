/* The checks behind "make final". You do not need to change this file. */
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <string.h>
#include "wordlist.h"

long blocks_in_use(void);
size_t last_block_size(void);
void counted_free(void *p);

static int wrong = 0;

static void check(int ok, const char *what, const char *help) {
    if (ok) {
        printf("OK     %s\n", what);
    } else {
        printf("WRONG  %s: %s\n", what, help);
        wrong = 1;
    }
}

static int starts_with_a(const char *word) {
    return word[0] == 'a';
}

int main(void) {
    const char *original = "hello";
    char *copy = copy_word(original);
    check(copy != NULL && copy != original && strcmp(copy, "hello") == 0, "copy_word makes a copy",
          "it should return a new block holding the same letters");
    check(copy != NULL && last_block_size() == 6, "copy_word uses exactly enough memory",
          "\"hello\" needs 6 bytes: 5 letters and the '\\0'");
    counted_free(copy);

    char **list = NULL;
    int n = 0;
    char buffer[10] = "first";
    int result = add_word(&list, &n, buffer);
    strcpy(buffer, "changed");
    check(result == 0 && n == 1 && list != NULL && strcmp(list[0], "first") == 0, "add_word adds a copy",
          "after one call, the count should be 1 and list[0] should keep \"first\", even when the caller's array changes");
    int second = add_word(&list, &n, "second");
    check(second == 0 && n == 2 && list != NULL && strcmp(list[0], "first") == 0 && strcmp(list[1], "second") == 0,
          "add_word adds to the end", "after two calls, the list should be \"first\", \"second\"");
    check(blocks_in_use() == 3, "the list holds the right blocks",
          "two words should hold 3 blocks: one for each word, and one for the list of pointers");

    free_words(list, n);
    check(blocks_in_use() == 0, "free_words frees everything",
          "after free_words, no blocks should be left. Free each word, then the list");

    check(is_long("apple") && is_long("banana") && !is_long("fig") && !is_long("pear") && !is_long(""),
          "is_long checks the length", "5 letters or more is long, so apple is long and pear is not");

    char *words[] = {"apple", "fig", "avocado", "banana"};
    check(count_matching(words, 4, is_long) == 3 && count_matching(words, 4, starts_with_a) == 2,
          "count_matching calls the rule it is given",
          "for apple, fig, avocado, banana, is_long matches 3 and a rule for words starting with a matches 2");

    char **many = NULL;
    int count = 0;
    int ok = 1;
    for (int i = 0; ok && i < 1000; i++)
        ok = add_word(&many, &count, "word") == 0;
    check(ok && count == 1000 && blocks_in_use() == 1001, "the list can keep growing",
          "1000 words should hold 1001 blocks");
    if (count > 0)
        free_words(many, count);

    char out[1000] = "";
    FILE *pipe = popen("printf 'apple\\nfig\\nbanana\\n' | ./words_checked", "r");
    if (pipe != NULL) {
        size_t got = fread(out, 1, sizeof(out) - 1, pipe);
        out[got] = '\0';
        pclose(pipe);
    }
    int matches = strcmp(out, "Read 3 words\nLong words: 2\napple\nbanana\nBlocks never freed: 0\n") == 0;
    check(matches, "the whole program works and frees everything",
          "for apple, fig, banana, it should print the counts and the long words, and leave no block unfreed");
    if (!matches)
        printf("       your program printed:\n%s\n", out);

    if (wrong) {
        printf("Not there yet: fix the first WRONG line, then run make final again.\n");
        return 1;
    }
    printf("OK: every final check passes.\n");
    return 0;
}
