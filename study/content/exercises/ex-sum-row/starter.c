/* Return the sum of one row of a grid with 3 rows and 4 columns.
   row is 0, 1, or 2. */
int sum_row(int grid[3][4], int row) {
    int total = 0;
    /* TODO: this adds only the first number of the row.
       Add all 4 numbers, with a loop over the columns. */
    total = total + grid[row][0];
    return total;
}
