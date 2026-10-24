// Practice 03: making choices with if, else, and switch.
// Replace each not_implemented(...) line with your code.
// From the c folder:  make practice LEVEL=03-conditions
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

int absolute(int n) {
    // Return n without its minus sign. absolute(-7) is 7, absolute(7) is 7.
    // Do not use the abs function. Write the if yourself.
    not_implemented("absolute");
}

bool is_even(int n) {
    // Return true when n is even, false otherwise. 0 is even. -4 is even.
    not_implemented("is_even");
}

int max3(int a, int b, int c) {
    // Return the largest of three numbers.
    not_implemented("max3");
}

int sign(int n) {
    // Return -1 when n is negative, 0 when n is 0, and 1 when n is positive.
    not_implemented("sign");
}

bool is_leap_year(int year) {
    // A classic exam question. A year is a leap year when:
    //   it divides by 4, but not by 100, unless it also divides by 400.
    // 2024 is leap. 1900 is not (divides by 100). 2000 is (divides by 400).
    not_implemented("is_leap_year");
}

char letter_grade(int score) {
    // score is 0 to 100. Return 'A' for 90 and up, 'B' for 80 to 89,
    // 'C' for 70 to 79, 'D' for 60 to 69, and 'F' below 60.
    not_implemented("letter_grade");
}

int days_in_month(int month, int year) {
    // month is 1 (January) to 12 (December). Return how many days it has.
    // February has 29 days in a leap year and 28 otherwise.
    // Hint: a switch, and your is_leap_year.
    not_implemented("days_in_month");
}

bool is_vowel(char c) {
    // Return true for a, e, i, o, u, in small or capital letters.
    not_implemented("is_vowel");
}

int triangle_kind(int a, int b, int c) {
    // a, b, c are the three side lengths. Return:
    //   0 when they cannot make a triangle: some side is 0 or less, or one
    //     side is at least as long as the other two together;
    //   1 when all three sides are equal;
    //   2 when exactly two sides are equal;
    //   3 when all three sides are different.
    not_implemented("triangle_kind");
}

int ticket_price(int age) {
    // A cinema charges by age:
    //   under 5: free (0);  5 to 17: 20;  18 to 64: 40;  65 and up: 25.
    not_implemented("ticket_price");
}

int calculate(int a, char op, int b) {
    // A tiny calculator. op is one of '+', '-', '*', '/'.
    // Return a op b. calculate(7, '*', 6) is 42.
    // For '/' with b equal to 0, return 0 instead of dividing.
    // Hint: switch works on a char.
    not_implemented("calculate");
}

static void test_abs(void) {
    expect_int(absolute(-7), 7);
    expect_int(absolute(7), 7);
    expect_int(absolute(0), 0);
}

static void test_even(void) {
    expect_true(is_even(4), "4 is even");
    expect_true(!is_even(7), "7 is odd");
    expect_true(is_even(0), "0 is even");
    expect_true(!is_even(-3), "-3 is odd");
}

static void test_max3(void) {
    expect_int(max3(1, 2, 3), 3);
    expect_int(max3(3, 2, 1), 3);
    expect_int(max3(2, 3, 1), 3);
    expect_int(max3(-5, -2, -9), -2);
}

static void test_sign(void) {
    expect_int(sign(-12), -1);
    expect_int(sign(0), 0);
    expect_int(sign(5), 1);
}

static void test_leap(void) {
    expect_true(is_leap_year(2024), "2024 is a leap year");
    expect_true(!is_leap_year(2023), "2023 is not a leap year");
    expect_true(!is_leap_year(1900), "1900 is not a leap year");
    expect_true(is_leap_year(2000), "2000 is a leap year");
}

static void test_grade(void) {
    expect_char(letter_grade(95), 'A');
    expect_char(letter_grade(90), 'A');
    expect_char(letter_grade(89), 'B');
    expect_char(letter_grade(72), 'C');
    expect_char(letter_grade(60), 'D');
    expect_char(letter_grade(59), 'F');
}

static void test_days(void) {
    expect_int(days_in_month(1, 2023), 31);
    expect_int(days_in_month(4, 2023), 30);
    expect_int(days_in_month(2, 2023), 28);
    expect_int(days_in_month(2, 2024), 29);
    expect_int(days_in_month(12, 2023), 31);
}

static void test_vowel(void) {
    expect_true(is_vowel('a'), "'a' is a vowel");
    expect_true(is_vowel('E'), "'E' is a vowel");
    expect_true(!is_vowel('b'), "'b' is not a vowel");
    expect_true(!is_vowel('?'), "'?' is not a vowel");
}

static void test_triangle(void) {
    expect_int(triangle_kind(3, 3, 3), 1);
    expect_int(triangle_kind(3, 3, 5), 2);
    expect_int(triangle_kind(5, 3, 3), 2);
    expect_int(triangle_kind(3, 4, 5), 3);
    expect_int(triangle_kind(1, 2, 3), 0);
    expect_int(triangle_kind(0, 4, 4), 0);
}

static void test_ticket(void) {
    expect_int(ticket_price(3), 0);
    expect_int(ticket_price(5), 20);
    expect_int(ticket_price(17), 20);
    expect_int(ticket_price(18), 40);
    expect_int(ticket_price(65), 25);
}

static void test_calculate(void) {
    expect_int(calculate(7, '*', 6), 42);
    expect_int(calculate(7, '+', 6), 13);
    expect_int(calculate(7, '-', 10), -3);
    expect_int(calculate(7, '/', 2), 3);
    expect_int(calculate(7, '/', 0), 0);
}

int main(void) {
    Score score = {0};
    task(&score, "absolute", test_abs);
    task(&score, "is_even", test_even);
    task(&score, "max3", test_max3);
    task(&score, "sign", test_sign);
    task(&score, "is_leap_year", test_leap);
    task(&score, "letter_grade", test_grade);
    task(&score, "days_in_month", test_days);
    task(&score, "is_vowel", test_vowel);
    task(&score, "triangle_kind", test_triangle);
    task(&score, "ticket_price", test_ticket);
    task(&score, "calculate", test_calculate);
    return score_finish(&score);
}
