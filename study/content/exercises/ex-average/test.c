int main(void) {
    double got;

    got = average(10, 2);
    CHECK("even split", got == 5.0, "average(10, 2) should be 5, but it returned %g", got);

    got = average(7, 2);
    CHECK("7 / 2 is 3.5", got == 3.5, "average(7, 2) should be 3.5, but it returned %g", got);

    got = average(-7, 2);
    CHECK("negative total", got == -3.5, "average(-7, 2) should be -3.5, but it returned %g", got);
    return 0;
}
