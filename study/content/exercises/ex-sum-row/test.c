int main(void) {
    int grid[3][4] = {{1, 2, 3, 4}, {10, 20, 30, 40}, {-1, -2, 3, 5}};
    int r = sum_row(grid, 0);
    CHECK("first row", r == 10, "row 0 holds 1, 2, 3, 4, so the sum should be 10, but you returned %d", r);
    r = sum_row(grid, 1);
    CHECK("middle row", r == 100, "row 1 holds 10, 20, 30, 40, so the sum should be 100, but you returned %d", r);
    r = sum_row(grid, 2);
    CHECK("negative numbers", r == 5, "row 2 holds -1, -2, 3, 5, so the sum should be 5, but you returned %d", r);
    return 0;
}
