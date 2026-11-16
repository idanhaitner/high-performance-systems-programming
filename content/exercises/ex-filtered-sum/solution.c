double filtered_sum(const float *a, int n, float t, int *count) {
    double sum = 0;
    int found = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > t) {
            sum += a[i];
            found++;
        }
    }
    *count = found;
    return sum;
}
