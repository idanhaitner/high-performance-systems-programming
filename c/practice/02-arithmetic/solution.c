// Practice 02: calculating. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=02-arithmetic

#include "../practice.h"

int rectangle_area(int width, int height) {
    // Return the area of a rectangle. rectangle_area(3, 4) is 12.
    return width * height;
}

int rectangle_perimeter(int width, int height) {
    // Return the length of the rectangle's border.
    // rectangle_perimeter(3, 4) is 14.
    return 2 * (width + height);
}

double celsius_to_fahrenheit(double celsius) {
    // F = C * 9 / 5 + 32.  celsius_to_fahrenheit(100) is 212.
    // celsius is a double, so the whole calculation is done with doubles
    // and nothing is cut off.
    return celsius * 9 / 5 + 32;
}

double average3(int a, int b, int c) {
    // Return the average of three ints, with the fraction kept.
    // average3(1, 2, 2) is 1.666667, not 1.
    // Trap: (a + b + c) / 3 divides two ints, and int division drops
    // the fraction.
    // Dividing by 3.0 (a double) makes C do double division.
    return (a + b + c) / 3.0;
}

double circle_area(double radius) {
    // Return pi * radius * radius. Use 3.14159265358979 for pi.
    const double pi = 3.14159265358979;
    return pi * radius * radius;
}

int last_digit(int n) {
    // n is 0 or more. Return its last digit. last_digit(1234) is 4.
    // Hint: the remainder when dividing by 10.
    return n % 10;
}

int drop_last_digit(int n) {
    // n is 0 or more. Return n without its last digit.
    // drop_last_digit(1234) is 123.
    // int division drops the fraction, which is exactly what we want here.
    return n / 10;
}

int hours_part(int seconds) {
    // seconds is 0 or more. 3725 seconds is 1 hour, 2 minutes, 5 seconds.
    // Return the hours: hours_part(3725) is 1.
    return seconds / 3600;
}

int minutes_part(int seconds) {
    // Return the minutes left after taking the full hours out.
    // minutes_part(3725) is 2.
    // First take what is left after the full hours, then count the
    // full minutes in it.
    return (seconds % 3600) / 60;
}

int seconds_part(int seconds) {
    // Return the seconds left after taking full minutes out.
    // seconds_part(3725) is 5.
    return seconds % 60;
}

int fewest_coins(int amount) {
    // Coins are worth 10, 5, 2, and 1. Return the smallest number of coins
    // that add up to amount (0 or more). fewest_coins(18) is 4: 10+5+2+1.
    // Hint: use as many 10s as you can, then 5s, then 2s, then 1s.
    // Do it with / and % only, no loops.
    int coins = amount / 10;  // how many 10s fit
    amount %= 10;             // what is left after them
    coins += amount / 5;
    amount %= 5;
    coins += amount / 2;
    amount %= 2;
    coins += amount;          // the rest are 1s
    return coins;
}

double price_after_discount(double price, int percent) {
    // Return the price after taking percent off.
    // price_after_discount(200, 15) is 170.
    return price * (100 - percent) / 100.0;
}

int round_up_divide(int items, int box_size) {
    // items and box_size are more than 0. Each box holds box_size items.
    // Return how many boxes are needed. round_up_divide(10, 4) is 3.
    // Hint: (items + box_size - 1) / box_size, and work out why it works.
    // Adding box_size - 1 pushes any leftover items past the next multiple
    // of box_size, so int division rounds up instead of down.
    return (items + box_size - 1) / box_size;
}

static void test_area(void) { expect_int(rectangle_area(3, 4), 12); }
static void test_perimeter(void) { expect_int(rectangle_perimeter(3, 4), 14); }
static void test_boiling(void) { expect_double(celsius_to_fahrenheit(100), 212); }
static void test_body(void) { expect_double(celsius_to_fahrenheit(37), 98.6); }
static void test_average(void) { expect_double(average3(1, 2, 2), 5.0 / 3.0); }
static void test_average_whole(void) { expect_double(average3(3, 4, 5), 4); }
static void test_circle(void) { expect_double(circle_area(2), 12.56637061435916); }
static void test_last_digit(void) { expect_int(last_digit(1234), 4); }
static void test_drop_last(void) { expect_int(drop_last_digit(1234), 123); }
static void test_drop_last_small(void) { expect_int(drop_last_digit(7), 0); }

static void test_hms(void) {
    expect_int(hours_part(3725), 1);
    expect_int(minutes_part(3725), 2);
    expect_int(seconds_part(3725), 5);
}

static void test_hms_big(void) {
    expect_int(hours_part(86399), 23);
    expect_int(minutes_part(86399), 59);
    expect_int(seconds_part(86399), 59);
}

static void test_coins(void) { expect_int(fewest_coins(18), 4); }
static void test_coins_zero(void) { expect_int(fewest_coins(0), 0); }
static void test_coins_big(void) { expect_int(fewest_coins(39), 6); }
static void test_discount(void) { expect_double(price_after_discount(200, 15), 170); }
static void test_discount_odd(void) { expect_double(price_after_discount(9.99, 10), 8.991); }
static void test_boxes(void) { expect_int(round_up_divide(10, 4), 3); }
static void test_boxes_exact(void) { expect_int(round_up_divide(12, 4), 3); }

int main(void) {
    Score score = {0};
    task(&score, "rectangle_area(3, 4) is 12", test_area);
    task(&score, "rectangle_perimeter(3, 4) is 14", test_perimeter);
    task(&score, "celsius_to_fahrenheit(100) is 212", test_boiling);
    task(&score, "celsius_to_fahrenheit(37) is 98.6", test_body);
    task(&score, "average3(1, 2, 2) is 1.666667", test_average);
    task(&score, "average3(3, 4, 5) is 4", test_average_whole);
    task(&score, "circle_area(2) is 12.566371", test_circle);
    task(&score, "last_digit(1234) is 4", test_last_digit);
    task(&score, "drop_last_digit(1234) is 123", test_drop_last);
    task(&score, "drop_last_digit(7) is 0", test_drop_last_small);
    task(&score, "3725 seconds is 1h 2m 5s", test_hms);
    task(&score, "86399 seconds is 23h 59m 59s", test_hms_big);
    task(&score, "fewest_coins(18) is 4", test_coins);
    task(&score, "fewest_coins(0) is 0", test_coins_zero);
    task(&score, "fewest_coins(39) is 6", test_coins_big);
    task(&score, "price_after_discount(200, 15) is 170", test_discount);
    task(&score, "price_after_discount(9.99, 10) is 8.991", test_discount_odd);
    task(&score, "round_up_divide(10, 4) is 3", test_boxes);
    task(&score, "round_up_divide(12, 4) is 3", test_boxes_exact);
    return score_finish(&score);
}
