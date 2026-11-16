int main(void) {
    double five[5] = {12, 11, 30, 12, 13};
    double m = median_time(five, 5);
    CHECK("five runs with one slow one", m == 12, "the median of {12, 11, 30, 12, 13} should be 12, but it is %g", m);

    double one[1] = {7.5};
    m = median_time(one, 1);
    CHECK("one run", m == 7.5, "the median of {7.5} should be 7.5, but it is %g", m);

    double three[3] = {3, 1, 2};
    m = median_time(three, 3);
    CHECK("times are not changed", m == 2 && three[0] == 3 && three[1] == 1 && three[2] == 2,
          "the median of {3, 1, 2} should be 2 and the array should still be {3, 1, 2}, but the median is %g and the array is {%g, %g, %g}",
          m, three[0], three[1], three[2]);
    return 0;
}
