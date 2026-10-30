int sum_row(int grid[3][4], int row) {
    int total = 0;
    for (int j = 0; j < 4; j++) {
        total = total + grid[row][j];
    }
    return total;
}
