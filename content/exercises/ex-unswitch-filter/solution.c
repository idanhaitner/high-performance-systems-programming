void filter(int n, const float *x, float *y, int mode) {
    if (mode == 1) {
        for (int i = 1; i < n - 1; i++)
            y[i] = (x[i - 1] + 2 * x[i] + x[i + 1]) / 4;
    } else {
        for (int i = 1; i < n - 1; i++)
            y[i] = x[i] - x[i - 1];
    }
}
