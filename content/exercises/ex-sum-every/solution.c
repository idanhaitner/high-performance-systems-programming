long sum_every(const int *a, int n, int stride) {
    long sum = 0;
    for (int i = 0; i < n; i += stride)
        sum += a[i];
    return sum;
}
