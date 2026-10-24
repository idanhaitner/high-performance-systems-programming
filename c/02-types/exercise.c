// Lesson 2 exercises.
// Replace each not_implemented(...) call with your code.
// From the c folder:  make try LESSON=02-types
// A finished version is in solution.c. Try before you open it.

#include "check.h"

#include <stdbool.h>

int storage_of_char(void) {
    // Return how many bytes a char occupies on this machine.
    // Use sizeof. It gives a size_t, so write (int)sizeof(...) to return it.
    not_implemented("storage_of_char");
}

int storage_of_int(void) {
    // Return how many bytes an int occupies on this machine.
    not_implemented("storage_of_int");
}

int storage_of_double(void) {
    // Return how many bytes a double occupies on this machine.
    not_implemented("storage_of_double");
}

int storage_of_pointer(void) {
    // Return how many bytes a void* occupies on this machine.
    not_implemented("storage_of_pointer");
}

int int_and_unsigned_same_width(void) {
    // Return 1 when int and unsigned have the same size, otherwise 0.
    // Hint: == already gives 1 or 0.
    not_implemented("int_and_unsigned_same_width");
}

int truth_value(void) {
    // Return the int value of the bool true. Do not type the number;
    // return true itself and let C convert it.
    not_implemented("truth_value");
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
