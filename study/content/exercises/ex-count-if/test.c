static int is_even(int x) { return x % 2 == 0; }
static int is_negative(int x) { return x < 0; }
static int is_big(int x) { return x > 100; }

int main(void) {
    int a[] = {1, 2, 3, 4};
    int got = count_if(a, 4, is_even);
    CHECK("even numbers", got == 2, "count_if({1, 2, 3, 4}, is_even) should be 2, but it is %d", got);

    int b[] = {-3, 5, -1, 0, 8};
    got = count_if(b, 5, is_negative);
    CHECK("negative numbers", got == 2, "count_if({-3, 5, -1, 0, 8}, is_negative) should be 2, but it is %d", got);

    int c[] = {50, 150, 250};
    got = count_if(c, 3, is_big);
    CHECK("bigger than 100", got == 2, "count_if({50, 150, 250}, is_big) should be 2, but it is %d", got);

    got = count_if(a, 0, is_even);
    CHECK("empty array", got == 0, "with n = 0 the count should be 0, but it is %d", got);
    return 0;
}
