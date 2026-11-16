void scale(const int *a, int *b, int n) {
    int i = 0;
    for (; i + 3 < n; i += 4) {
        b[i] = a[i] * 3 + 7;
        b[i + 1] = a[i + 1] * 3 + 7;
        b[i + 2] = a[i + 2] * 3 + 7;
        b[i + 3] = a[i + 3] * 3 + 7;
    }
    for (; i < n; i++)
        b[i] = a[i] * 3 + 7;
}
