int column_sum(const int *a, int rows, int cols, int j) {
    int sum = 0;
    for (int i = 0; i < rows; i++)
        sum += a[i * cols + j];
    return sum;
}
