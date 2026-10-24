// Practice 01: printing. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=01-printing

#include "../practice.h"

void say_hello(void) {
    // Print:  Hello, World!
    // and then end the line.
    // \n is the "new line" character. Without it, the next print would
    // continue on the same line.
    printf("Hello, World!\n");
}

void greet(const char* name) {
    // name is a piece of text, such as "Idan".
    // Print:  Hello, Idan!
    // Hint: %s in printf is replaced by a piece of text.
    printf("Hello, %s!\n", name);
}

void introduce(const char* name, int age) {
    // Print:  My name is Idan and I am 23 years old.
    // (with the given name and age). Hint: %d prints an int.
    // Each % placeholder takes the next argument, in order.
    printf("My name is %s and I am %d years old.\n", name, age);
}

void next_year(const char* name, int age) {
    // Print how old the person will be next year:
    //   Next year Idan will be 24.
    // printf can print the result of a calculation directly.
    printf("Next year %s will be %d.\n", name, age + 1);
}

void price_tag(const char* item, double price) {
    // Print the price with exactly two digits after the point:
    //   Coffee costs 12.50 NIS
    // Hint: %.2f prints a double with two digits after the point.
    printf("%s costs %.2f NIS\n", item, price);
}

void print_n_times(const char* text, int n) {
    // Print text n times, each on its own line.
    // print_n_times("hi", 3) prints:
    //   hi
    //   hi
    //   hi
    for (int i = 0; i < n; i++) {
        printf("%s\n", text);
    }
}

void count_up(int n) {
    // Print the numbers 1 to n on one line, with one space between them
    // and no space at the end. count_up(5) prints:  1 2 3 4 5
    // Print the first number alone. Then print " k" for every later number,
    // so a space only ever appears between two numbers.
    printf("1");
    for (int i = 2; i <= n; i++) {
        printf(" %d", i);
    }
    printf("\n");
}

void stars(int n) {
    // Print n stars on one line. stars(4) prints:  ****
    for (int i = 0; i < n; i++) {
        printf("*");
    }
    printf("\n");
}

void rectangle(int width, int height) {
    // Print a rectangle of stars. rectangle(4, 2) prints:
    //   ****
    //   ****
    // Hint: one loop inside another. You may call stars.
    // Each row is exactly what stars(width) prints.
    for (int row = 0; row < height; row++) {
        stars(width);
    }
}

void triangle(int n) {
    // Print a triangle with n rows. Row 1 has 1 star, row 2 has 2, ...
    // triangle(3) prints:
    //   *
    //   **
    //   ***
    for (int row = 1; row <= n; row++) {
        stars(row);
    }
}

void countdown(int n) {
    // Print n, n-1, ..., 1 on separate lines, then "Liftoff!".
    // countdown(3) prints:
    //   3
    //   2
    //   1
    //   Liftoff!
    for (int i = n; i >= 1; i--) {
        printf("%d\n", i);
    }
    printf("Liftoff!\n");
}

void times_table(int n) {
    // Print the multiplication table of n, from 1 to 10.
    // times_table(7) prints 10 lines:
    //   7 x 1 = 7
    //   7 x 2 = 14
    //   ...
    //   7 x 10 = 70
    for (int i = 1; i <= 10; i++) {
        printf("%d x %d = %d\n", n, i, n * i);
    }
}

void fizzbuzz(int n) {
    // A classic interview and exam question. For every number from 1 to n,
    // print one line:
    //   "FizzBuzz" if the number divides by both 3 and 5,
    //   "Fizz"     if it divides by 3 only,
    //   "Buzz"     if it divides by 5 only,
    //   the number itself otherwise.
    // Hint: "a divides by b" means a % b == 0.
    // Check "both" first. Otherwise 15 would stop at the "Fizz" test.
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) {
            printf("FizzBuzz\n");
        } else if (i % 3 == 0) {
            printf("Fizz\n");
        } else if (i % 5 == 0) {
            printf("Buzz\n");
        } else {
            printf("%d\n", i);
        }
    }
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
