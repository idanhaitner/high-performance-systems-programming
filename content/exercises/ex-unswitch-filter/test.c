int main(void) {
    float x[5] = {0, 4, 8, 4, 0};
    float y[5] = {-1, -1, -1, -1, -1};
    filter(5, x, y, 1);
    CHECK("smoothing mode", y[1] == 4 && y[2] == 6 && y[3] == 4,
          "with x = {0, 4, 8, 4, 0} and mode 1, y[1..3] should be 4, 6, 4, but they are %g, %g, %g", y[1], y[2], y[3]);

    float z[5] = {-1, -1, -1, -1, -1};
    filter(5, x, z, 7);
    CHECK("difference mode", z[1] == 4 && z[2] == 4 && z[3] == -4,
          "with x = {0, 4, 8, 4, 0} and mode 7, y[1..3] should be 4, 4, -4, but they are %g, %g, %g", z[1], z[2], z[3]);

    float w[3] = {9, 9, 9};
    float v[3] = {2, 6, 10};
    filter(3, v, w, 1);
    CHECK("ends are left alone", w[0] == 9 && w[2] == 9 && w[1] == 6,
          "with n = 3, only y[1] may change (to 6), and y[0] and y[2] should stay 9, but y is {%g, %g, %g}", w[0], w[1], w[2]);
    return 0;
}
