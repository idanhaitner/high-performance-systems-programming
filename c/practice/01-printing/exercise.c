// Practice 01: printing.
// Write each function so it prints exactly the text its comment shows.
// Spaces, capital letters, and the '\n' at the end of each line all count.
// From the c folder:  make practice LEVEL=01-printing
// A finished version is in solution.c. Try before you open it.

#include "../practice.h"

void say_hello(void) {
    // Print:  Hello, World!
    // and then end the line.
    // Write your code here.
}

void greet(const char* name) {
    // name is a piece of text, such as "Idan".
    // Print:  Hello, Idan!
    // Hint: %s in printf is replaced by a piece of text.
    // Write your code here.
}

void introduce(const char* name, int age) {
    // Print:  My name is Idan and I am 23 years old.
    // (with the given name and age). Hint: %d prints an int.
    // Write your code here.
}

void next_year(const char* name, int age) {
    // Print how old the person will be next year:
    //   Next year Idan will be 24.
    // Write your code here.
}

void price_tag(const char* item, double price) {
    // Print the price with exactly two digits after the point:
    //   Coffee costs 12.50 NIS
    // Hint: %.2f prints a double with two digits after the point.
    // Write your code here.
}

void print_n_times(const char* text, int n) {
    // Print text n times, each on its own line.
    // print_n_times("hi", 3) prints:
    //   hi
    //   hi
    //   hi
    // Write your code here.
}

void count_up(int n) {
    // Print the numbers 1 to n on one line, with one space between them
    // and no space at the end. count_up(5) prints:  1 2 3 4 5
    // Write your code here.
}

void stars(int n) {
    // Print n stars on one line. stars(4) prints:  ****
    // Write your code here.
}

void rectangle(int width, int height) {
    // Print a rectangle of stars. rectangle(4, 2) prints:
    //   ****
    //   ****
    // Hint: one loop inside another. You may call stars.
    not_implemented("rectangle");
}

void triangle(int n) {
    // Print a triangle with n rows. Row 1 has 1 star, row 2 has 2, ...
    // triangle(3) prints:
    //   *
    //   **
    //   ***
    not_implemented("triangle");
}

void countdown(int n) {
    // Print n, n-1, ..., 1 on separate lines, then "Liftoff!".
    // countdown(3) prints:
    //   3
    //   2
    //   1
    //   Liftoff!
    // Write your code here.
}

void times_table(int n) {
    // Print the multiplication table of n, from 1 to 10.
    // times_table(7) prints 10 lines:
    //   7 x 1 = 7
    //   7 x 2 = 14
    //   ...
    //   7 x 10 = 70
    // Write your code here.
}

void fizzbuzz(int n) {
    // A classic interview and exam question. For every number from 1 to n,
    // print one line:
    //   "FizzBuzz" if the number divides by both 3 and 5,
    //   "Fizz"     if it divides by 3 only,
    //   "Buzz"     if it divides by 5 only,
    //   the number itself otherwise.
    // Hint: "a divides by b" means a % b == 0.
    // Write your code here.
}

static void test_hello(void) {
    capture_begin();
    say_hello();
    expect_printed("Hello, World!\n", "say_hello");
}

static void test_greet(void) {
    capture_begin();
    greet("Idan");
    expect_printed("Hello, Idan!\n", "greet");
}

static void test_introduce(void) {
    capture_begin();
    introduce("Idan", 23);
    expect_printed("My name is Idan and I am 23 years old.\n", "introduce");
}

static void test_next_year(void) {
    capture_begin();
    next_year("Dana", 30);
    expect_printed("Next year Dana will be 31.\n", "next_year");
}

static void test_price(void) {
    capture_begin();
    price_tag("Coffee", 12.5);
    expect_printed("Coffee costs 12.50 NIS\n", "price_tag");
}

static void test_n_times(void) {
    capture_begin();
    print_n_times("hi", 3);
    expect_printed("hi\nhi\nhi\n", "print_n_times");
}

static void test_count_up(void) {
    capture_begin();
    count_up(5);
    expect_printed("1 2 3 4 5\n", "count_up");
}

static void test_stars(void) {
    capture_begin();
    stars(4);
    expect_printed("****\n", "stars");
}

static void test_rectangle(void) {
    capture_begin();
    rectangle(4, 2);
    expect_printed("****\n****\n", "rectangle");
}

static void test_triangle(void) {
    capture_begin();
    triangle(3);
    expect_printed("*\n**\n***\n", "triangle");
}

static void test_countdown(void) {
    capture_begin();
    countdown(3);
    expect_printed("3\n2\n1\nLiftoff!\n", "countdown");
}

static void test_times_table(void) {
    capture_begin();
    times_table(7);
    expect_printed("7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n"
                   "7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n"
                   "7 x 9 = 63\n7 x 10 = 70\n",
                   "times_table");
}

static void test_fizzbuzz(void) {
    capture_begin();
    fizzbuzz(15);
    expect_printed("1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n"
                   "11\nFizz\n13\n14\nFizzBuzz\n",
                   "fizzbuzz");
}

int main(void) {
    Score score = {0};
    task(&score, "say_hello prints Hello, World!", test_hello);
    task(&score, "greet(\"Idan\")", test_greet);
    task(&score, "introduce(\"Idan\", 23)", test_introduce);
    task(&score, "next_year(\"Dana\", 30)", test_next_year);
    task(&score, "price_tag(\"Coffee\", 12.5)", test_price);
    task(&score, "print_n_times(\"hi\", 3)", test_n_times);
    task(&score, "count_up(5)", test_count_up);
    task(&score, "stars(4)", test_stars);
    task(&score, "rectangle(4, 2)", test_rectangle);
    task(&score, "triangle(3)", test_triangle);
    task(&score, "countdown(3)", test_countdown);
    task(&score, "times_table(7)", test_times_table);
    task(&score, "fizzbuzz(15)", test_fizzbuzz);
    return score_finish(&score);
}
