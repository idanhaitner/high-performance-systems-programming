int main(void) {
    Point p[3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int x[4] = {0, 0, 0, -1}, y[4] = {0, 0, 0, -1}, z[4] = {0, 0, 0, -1};
    split_points(p, 3, x, y, z);

    CHECK("x values", x[0] == 1 && x[1] == 4 && x[2] == 7, "x should be {1, 4, 7}, but it is {%d, %d, %d}", x[0], x[1], x[2]);
    CHECK("y and z values", y[0] == 2 && y[1] == 5 && y[2] == 8 && z[0] == 3 && z[1] == 6 && z[2] == 9,
          "y should be {2, 5, 8} and z should be {3, 6, 9}, but y is {%d, %d, %d} and z is {%d, %d, %d}", y[0], y[1], y[2], z[0], z[1], z[2]);
    CHECK("nothing extra", x[3] == -1 && y[3] == -1 && z[3] == -1, "the function wrote past the n numbers it was asked to copy");
    return 0;
}
