int main(void) {
    long long got;

    got = sum_squares(3);
    CHECK("small n", got == 14, "sum_squares(3) should be 1 + 4 + 9 = 14, but it returned %lld", got);

    got = sum_squares(0);
    CHECK("n is zero", got == 0, "sum_squares(0) should be 0, but it returned %lld", got);

    got = sum_squares(2000);
    CHECK("n = 2000 needs a bigger type", got == 2668667000LL,
          "sum_squares(2000) should be 2668667000, but it returned %lld", got);
    return 0;
}
