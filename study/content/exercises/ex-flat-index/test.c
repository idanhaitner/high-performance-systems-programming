int main(void) {
    int t[6] = {10, 11, 12, 20, 21, 22};
    int v = cell(t, 3, 0, 2);
    CHECK("first row", v == 12, "cell(t, 3, 0, 2) should be 12, the last number of row 0, but you returned %d", v);

    v = cell(t, 3, 1, 0);
    CHECK("second row", v == 20, "cell(t, 3, 1, 0) should be 20, the first number of row 1, but you returned %d", v);

    int u[12] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11};
    v = cell(u, 4, 2, 1);
    CHECK("wider table", v == 9, "in a table with 4 columns, row 2 starts at position 8, so cell(u, 4, 2, 1) should be 9, but you returned %d", v);
    return 0;
}
