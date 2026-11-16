int main(void) {
    float a[5] = {1, 5, 2, 8, 3};
    int count = -1;
    double s = filtered_sum(a, 5, 2, &count);
    CHECK("some values pass", s == 16 && count == 3,
          "with a = {1, 5, 2, 8, 3} and t = 2, the sum should be 16 and the count 3, but they are %g and %d", s, count);

    float b[4] = {4, 4, 4, 5};
    count = -1;
    s = filtered_sum(b, 4, 4, &count);
    CHECK("equal is not greater", s == 5 && count == 1,
          "with a = {4, 4, 4, 5} and t = 4, only the 5 counts: the sum should be 5 and the count 1, but they are %g and %d", s, count);

    float c[3] = {1, 2, 3};
    count = 42;
    s = filtered_sum(c, 3, 10, &count);
    CHECK("nothing passes", s == 0 && count == 0,
          "with t = 10, nothing passes: the sum and the count should both be 0, but they are %g and %d", s, count);
    return 0;
}
