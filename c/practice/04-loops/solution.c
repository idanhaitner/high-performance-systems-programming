// Practice 04: loops. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=04-loops

#include "../practice.h"

int sum_to(int n) {
    // Return 1 + 2 + ... + n. When n is 0 or less, return 0.
    // sum_to(4) is 10.
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    return total;
}

int sum_of_evens(int n) {
    // Return the sum of the even numbers from 1 to n.
    // sum_of_evens(7) is 2 + 4 + 6 = 12.
    // Start at 2 and step by 2, so the loop only visits even numbers.
    int total = 0;
    for (int i = 2; i <= n; i += 2) {
        total += i;
    }
    return total;
}

int factorial(int n) {
    // n is 0 to 12. Return n! = 1 * 2 * ... * n. 0! is 1.
    // factorial(5) is 120.
    // Start the product at 1, not 0: multiplying by 0 would wipe it out.
    // For n = 0 the loop never runs and 1 is returned.
    int product = 1;
    for (int i = 2; i <= n; i++) {
        product *= i;
    }
    return product;
}

int power(int base, int exponent) {
    // exponent is 0 or more. Return base multiplied by itself exponent
    // times. power(2, 10) is 1024. power(7, 0) is 1.
    int result = 1;
    for (int i = 0; i < exponent; i++) {
        result *= base;
    }
    return result;
}

int count_digits(int n) {
    // n is 0 or more. Return how many digits it has.
    // count_digits(4096) is 4. count_digits(0) is 1.
    // Hint: keep dividing by 10.
    // A do-while runs its body at least once, so 0 counts as one digit.
    int count = 0;
    do {
        count++;
        n /= 10;
    } while (n > 0);
    return count;
}

int digit_sum(int n) {
    // n is 0 or more. Return the sum of its digits. digit_sum(4096) is 19.
    // n % 10 is the last digit. n / 10 removes it. Repeat until none left.
    int total = 0;
    while (n > 0) {
        total += n % 10;
        n /= 10;
    }
    return total;
}

int reverse_digits(int n) {
    // n is 0 or more. Return its digits in reverse order.
    // reverse_digits(1234) is 4321. reverse_digits(1200) is 21.
    // Take digits off the end of n, and push each one onto the end of
    // result. Multiplying result by 10 makes room for the new digit.
    int result = 0;
    while (n > 0) {
        result = result * 10 + n % 10;
        n /= 10;
    }
    return result;
}

bool is_palindrome_number(int n) {
    // n is 0 or more. Return true when n reads the same both ways.
    // 12321 is, 1231 is not. Hint: use reverse_digits.
    return reverse_digits(n) == n;
}

bool is_prime(int n) {
    // A prime is a number above 1 that only divides by 1 and itself.
    // is_prime(7) is true. is_prime(9) is false. is_prime(1) is false.
    if (n < 2) {
        return false;
    }
    // If n = a * b, the smaller of a and b is at most the square root of n.
    // So it is enough to test divisors d with d * d <= n.
    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            return false;
        }
    }
    return true;
}

int count_primes_up_to(int n) {
    // Return how many primes there are from 2 to n.
    // count_primes_up_to(20) is 8: 2, 3, 5, 7, 11, 13, 17, 19.
    int count = 0;
    for (int i = 2; i <= n; i++) {
        if (is_prime(i)) {
            count++;
        }
    }
    return count;
}

int gcd(int a, int b) {
    // a and b are more than 0. Return the greatest common divisor: the
    // biggest number that divides both. gcd(12, 18) is 6.
    // Hint (Euclid): gcd(a, b) is gcd(b, a % b), and gcd(a, 0) is a.
    while (b != 0) {
        int rest = a % b;
        a = b;
        b = rest;
    }
    return a;
}

int fibonacci(int n) {
    // The Fibonacci numbers are 0, 1, 1, 2, 3, 5, 8, 13, ...
    // Each one is the sum of the two before it. Return number n,
    // counting from 0: fibonacci(0) is 0, fibonacci(7) is 13.
    // Use a loop, not recursion.
    // Keep only the last two numbers, and slide them forward n times.
    int previous = 0;
    int current = 1;
    for (int i = 0; i < n; i++) {
        int next = previous + current;
        previous = current;
        current = next;
    }
    return previous;
}

int collatz_steps(int n) {
    // n is more than 0. Repeat until n is 1: if n is even, halve it;
    // otherwise make it 3 * n + 1. Return how many steps that took.
    // collatz_steps(6) is 8: 6 3 10 5 16 8 4 2 1.
    int steps = 0;
    while (n != 1) {
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    return steps;
}

bool is_perfect(int n) {
    // A perfect number equals the sum of its divisors below itself.
    // 28 is perfect: 1 + 2 + 4 + 7 + 14 = 28. 12 is not.
    if (n < 2) {
        return false;
    }
    int total = 0;
    for (int d = 1; d < n; d++) {
        if (n % d == 0) {
            total += d;
        }
    }
    return total == n;
}

int binary_to_decimal(int bits) {
    // bits is a number written only with the digits 0 and 1, such as 1011.
    // Read it as a binary number and return its value: 1011 is 11.
    // Walk the digits from the right. Each one is worth twice as much as
    // the one before it: 1, 2, 4, 8, ...
    int value = 0;
    int place = 1;
    while (bits > 0) {
        value += (bits % 10) * place;
        place *= 2;
        bits /= 10;
    }
    return value;
}

static void test_sum_to(void) {
    expect_int(sum_to(4), 10);
    expect_int(sum_to(100), 5050);
    expect_int(sum_to(0), 0);
}

static void test_evens(void) {
    expect_int(sum_of_evens(7), 12);
    expect_int(sum_of_evens(1), 0);
}

static void test_factorial(void) {
    expect_int(factorial(5), 120);
    expect_int(factorial(0), 1);
    expect_int(factorial(12), 479001600);
}

static void test_power(void) {
    expect_int(power(2, 10), 1024);
    expect_int(power(7, 0), 1);
    expect_int(power(-3, 3), -27);
}

static void test_count_digits(void) {
    expect_int(count_digits(4096), 4);
    expect_int(count_digits(0), 1);
    expect_int(count_digits(9), 1);
}

static void test_digit_sum(void) {
    expect_int(digit_sum(4096), 19);
    expect_int(digit_sum(0), 0);
}

static void test_reverse(void) {
    expect_int(reverse_digits(1234), 4321);
    expect_int(reverse_digits(1200), 21);
    expect_int(reverse_digits(5), 5);
}

static void test_palindrome(void) {
    expect_true(is_palindrome_number(12321), "12321 is a palindrome");
    expect_true(!is_palindrome_number(1231), "1231 is not a palindrome");
    expect_true(is_palindrome_number(7), "7 is a palindrome");
}

static void test_prime(void) {
    expect_true(is_prime(2), "2 is prime");
    expect_true(is_prime(7), "7 is prime");
    expect_true(!is_prime(9), "9 is not prime");
    expect_true(!is_prime(1), "1 is not prime");
    expect_true(!is_prime(0), "0 is not prime");
    expect_true(is_prime(97), "97 is prime");
}

static void test_count_primes(void) {
    expect_int(count_primes_up_to(20), 8);
    expect_int(count_primes_up_to(100), 25);
}

static void test_gcd(void) {
    expect_int(gcd(12, 18), 6);
    expect_int(gcd(17, 5), 1);
    expect_int(gcd(9, 9), 9);
}

static void test_fibonacci(void) {
    expect_int(fibonacci(0), 0);
    expect_int(fibonacci(1), 1);
    expect_int(fibonacci(7), 13);
    expect_int(fibonacci(20), 6765);
}

static void test_collatz(void) {
    expect_int(collatz_steps(6), 8);
    expect_int(collatz_steps(1), 0);
    expect_int(collatz_steps(27), 111);
}

static void test_perfect(void) {
    expect_true(is_perfect(6), "6 is perfect");
    expect_true(is_perfect(28), "28 is perfect");
    expect_true(!is_perfect(12), "12 is not perfect");
    expect_true(!is_perfect(1), "1 is not perfect");
}

static void test_binary(void) {
    expect_int(binary_to_decimal(1011), 11);
    expect_int(binary_to_decimal(0), 0);
    expect_int(binary_to_decimal(11111111), 255);
}

int main(void) {
    Score score = {0};
    task(&score, "sum_to", test_sum_to);
    task(&score, "sum_of_evens", test_evens);
    task(&score, "factorial", test_factorial);
    task(&score, "power", test_power);
    task(&score, "count_digits", test_count_digits);
    task(&score, "digit_sum", test_digit_sum);
    task(&score, "reverse_digits", test_reverse);
    task(&score, "is_palindrome_number", test_palindrome);
    task(&score, "is_prime", test_prime);
    task(&score, "count_primes_up_to", test_count_primes);
    task(&score, "gcd", test_gcd);
    task(&score, "fibonacci", test_fibonacci);
    task(&score, "collatz_steps", test_collatz);
    task(&score, "is_perfect", test_perfect);
    task(&score, "binary_to_decimal", test_binary);
    return score_finish(&score);
}
