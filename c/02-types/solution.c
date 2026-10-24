// Finished lesson 2. Write yours in exercise.c first.

#include "check.h"

#include <stdbool.h>

// sizeof gives a size_t. The (int) converts it to the int this function
// returns. Asking sizeof keeps the answer right on every machine.
int storage_of_char(void) {
    return (int)sizeof(char);
}

int storage_of_int(void) {
    return (int)sizeof(int);
}

int storage_of_double(void) {
    return (int)sizeof(double);
}

int storage_of_pointer(void) {
    return (int)sizeof(void*);
}

// == already gives 1 or 0, so its result can be returned directly.
int int_and_unsigned_same_width(void) {
    return sizeof(int) == sizeof(unsigned);
}

// true converts to the int 1.
int truth_value(void) {
    return true;
}

static void test_char(void) {
    expect_int(storage_of_char(), (int)sizeof(char));
}

static void test_int(void) {
    expect_int(storage_of_int(), (int)sizeof(int));
}

static void test_double(void) {
    expect_int(storage_of_double(), (int)sizeof(double));
}

static void test_pointer(void) {
    expect_int(storage_of_pointer(), (int)sizeof(void*));
}

static void test_unsigned_width(void) {
    expect_int(int_and_unsigned_same_width(),
               sizeof(int) == sizeof(unsigned));
}

static void test_true(void) {
    expect_int(truth_value(), true);
}

int main(void) {
    Score score = {0};
    task(&score, "storage_of_char() is sizeof(char)", test_char);
    task(&score, "storage_of_int() is sizeof(int)", test_int);
    task(&score, "storage_of_double() is sizeof(double)", test_double);
    task(&score, "storage_of_pointer() is sizeof(void*)", test_pointer);
    task(&score, "int and unsigned have the same width", test_unsigned_width);
    task(&score, "truth_value() is true", test_true);
    return score_finish(&score);
}
