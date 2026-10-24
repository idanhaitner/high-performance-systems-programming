// Practice 06: strings.
// A C string is an array of chars that ends with the character '\0'.
// Loop until you reach '\0'. Do not use <string.h> functions here:
// writing them yourself is the exercise.
// From the c folder:  make practice LEVEL=06-strings
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

int my_strlen(const char* s) {
    // Return the number of characters before '\0'. my_strlen("hello") is 5.
    not_implemented("my_strlen");
}

int count_vowels(const char* s) {
    // Return how many of a, e, i, o, u (small or capital) are in s.
    not_implemented("count_vowels");
}

void to_upper(char* s) {
    // Change every small letter in s to a capital. Leave everything else.
    // "Hi there 2!" becomes "HI THERE 2!".
    // Hint: 'a' to 'z' are in a row, and so are 'A' to 'Z', so
    // c - 'a' + 'A' turns a small letter c into its capital.
    not_implemented("to_upper");
}

void reverse_string(char* s) {
    // Reverse s in place. "hello" becomes "olleh".
    not_implemented("reverse_string");
}

bool is_palindrome(const char* s) {
    // Return true when s reads the same backwards. "racecar" is,
    // "hello" is not. The empty string is.
    not_implemented("is_palindrome");
}

void my_strcpy(char* dst, const char* src) {
    // Copy src into dst, including the '\0' at the end.
    // dst has enough room.
    not_implemented("my_strcpy");
}

int my_strcmp(const char* a, const char* b) {
    // Compare two strings in dictionary order. Return a negative number
    // when a comes first, 0 when they are equal, a positive number when
    // b comes first. Any negative or positive value is fine.
    // "apple" vs "banana": negative. "cat" vs "car": positive.
    // "car" vs "cart": negative (a shorter string comes first).
    not_implemented("my_strcmp");
}

int count_words(const char* s) {
    // Words are separated by one or more spaces. There may be spaces at the
    // start or end. count_words("  hello   big world ") is 3.
    // Hint: count the places where a word starts.
    not_implemented("count_words");
}

int my_atoi(const char* s) {
    // Turn text such as "123" or "-45" into the int it shows.
    // s is an optional '-' followed by digits only.
    // Hint: the digit character c has the value c - '0'.
    not_implemented("my_atoi");
}

void caesar(char* s, int shift) {
    // Shift every small letter forward by shift places (0 to 25) in the
    // alphabet, wrapping from z back to a. Leave everything else.
    // caesar("hello, xyz", 3) gives "khoor, abc".
    not_implemented("caesar");
}

int char_count(const char* s, char c) {
    // Return how many times c appears in s.
    not_implemented("char_count");
}

void remove_char(char* s, char c) {
    // Remove every c from s, in place. remove_char of "banana" and 'a'
    // leaves "bnn".
    // Hint: one index reads, another writes.
    not_implemented("remove_char");
}

static void test_strlen(void) {
    expect_int(my_strlen("hello"), 5);
    expect_int(my_strlen(""), 0);
}

static void test_vowels(void) {
    expect_int(count_vowels("Hello World"), 3);
    expect_int(count_vowels("AEIOU xyz"), 5);
}

static void test_upper(void) {
    char s[] = "Hi there 2!";
    to_upper(s);
    expect_str(s, "HI THERE 2!");
}

static void test_reverse(void) {
    char s[] = "hello";
    char even[] = "abcd";
    char empty[] = "";
    reverse_string(s);
    reverse_string(even);
    reverse_string(empty);
    expect_str(s, "olleh");
    expect_str(even, "dcba");
    expect_str(empty, "");
}

static void test_palindrome(void) {
    expect_true(is_palindrome("racecar"), "racecar is a palindrome");
    expect_true(is_palindrome("abba"), "abba is a palindrome");
    expect_true(!is_palindrome("hello"), "hello is not a palindrome");
    expect_true(is_palindrome(""), "the empty string is a palindrome");
}

static void test_strcpy(void) {
    char dst[16] = "xxxxxxxxxxxxxxx";
    my_strcpy(dst, "copy me");
    expect_str(dst, "copy me");
}

static void test_strcmp(void) {
    expect_true(my_strcmp("apple", "banana") < 0, "apple comes before banana");
    expect_true(my_strcmp("cat", "car") > 0, "cat comes after car");
    expect_true(my_strcmp("car", "cart") < 0, "car comes before cart");
    expect_true(my_strcmp("same", "same") == 0, "same equals same");
}

static void test_words(void) {
    expect_int(count_words("  hello   big world "), 3);
    expect_int(count_words("one"), 1);
    expect_int(count_words("    "), 0);
}

static void test_atoi(void) {
    expect_int(my_atoi("123"), 123);
    expect_int(my_atoi("-45"), -45);
    expect_int(my_atoi("0"), 0);
}

static void test_caesar(void) {
    char s[] = "hello, xyz";
    caesar(s, 3);
    expect_str(s, "khoor, abc");
}

static void test_char_count(void) {
    expect_int(char_count("banana", 'a'), 3);
    expect_int(char_count("banana", 'z'), 0);
}

static void test_remove(void) {
    char s[] = "banana";
    remove_char(s, 'a');
    expect_str(s, "bnn");
}

int main(void) {
    Score score = {0};
    task(&score, "my_strlen", test_strlen);
    task(&score, "count_vowels", test_vowels);
    task(&score, "to_upper", test_upper);
    task(&score, "reverse_string", test_reverse);
    task(&score, "is_palindrome", test_palindrome);
    task(&score, "my_strcpy", test_strcpy);
    task(&score, "my_strcmp", test_strcmp);
    task(&score, "count_words", test_words);
    task(&score, "my_atoi", test_atoi);
    task(&score, "caesar", test_caesar);
    task(&score, "char_count", test_char_count);
    task(&score, "remove_char", test_remove);
    return score_finish(&score);
}
