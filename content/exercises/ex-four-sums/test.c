int main(void) {
    double a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    double s = sum4(a, 8);
    CHECK("multiple of four", s == 36, "the sum of 1 to 8 should be 36, but it is %g", s);

    s = sum4(a, 10);
    CHECK("numbers left over", s == 55, "the sum of 1 to 10 should be 55, but it is %g", s);

    double b[3] = {2.5, 4, -1};
    s = sum4(b, 3);
    CHECK("fewer than four", s == 5.5, "the sum of {2.5, 4, -1} should be 5.5, but it is %g", s);

    double c[1] = {99};
    s = sum4(c, 0);
    CHECK("empty array", s == 0, "with n = 0 the sum should be 0, but it is %g", s);
    return 0;
}
