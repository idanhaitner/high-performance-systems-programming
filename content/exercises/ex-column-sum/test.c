int main(void) {
    int t[6] = {1, 2, 3, 4, 5, 6};
    int v = column_sum(t, 2, 3, 1);
    CHECK("middle column", v == 7, "column 1 holds 2 and 5, so the sum should be 7, but you returned %d", v);

    int u[9] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
    v = column_sum(u, 3, 3, 2);
    CHECK("last column", v == 18, "column 2 holds 3, 6, and 9, so the sum should be 18, but you returned %d", v);

    int one[4] = {5, 6, 7, 8};
    v = column_sum(one, 1, 4, 3);
    CHECK("one row", v == 8, "a table with one row has just one number in column 3, which is 8, but you returned %d", v);
    return 0;
}
