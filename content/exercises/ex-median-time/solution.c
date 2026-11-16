double median_time(const double *times, int n) {
    double sorted[15];
    for (int i = 0; i < n; i++) {
        double t = times[i];
        int j = i;
        while (j > 0 && sorted[j - 1] > t) {
            sorted[j] = sorted[j - 1];
            j--;
        }
        sorted[j] = t;
    }
    return sorted[n / 2];
}
