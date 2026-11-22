static int first_wrong(const long *got, const long *want) {
    for (int v = 0; v < 10; v++)
        if (got[v] != want[v]) return v;
    return -1;
}

int main(void) {
    int a[6] = {3, 1, 3, 9, 0, 3};
    long bins[10], want[10] = {1, 1, 0, 3, 0, 0, 0, 0, 0, 1};
    for (int v = 0; v < 10; v++) bins[v] = 0;
    parallel_histogram(a, 6, 2, bins);
    int v = first_wrong(bins, want);
    CHECK("small example", v < 0, "bins[%d] should be %ld, but it is %ld", v, v < 0 ? 0 : want[v], v < 0 ? 0 : bins[v]);

    for (int k = 0; k < 10; k++) bins[k] = 77;
    parallel_histogram(a, 6, 3, bins);
    v = first_wrong(bins, want);
    CHECK("old values cleared", v < 0, "bins[%d] should be %ld, but it is %ld", v, v < 0 ? 0 : want[v], v < 0 ? 0 : bins[v]);

    static int many[10000];
    long want_many[10] = {0};
    for (int i = 0; i < 10000; i++) {
        many[i] = (i * 7 + i / 13) % 10;
        want_many[many[i]]++;
    }
    for (int k = 0; k < 10; k++) bins[k] = 0;
    parallel_histogram(many, 10000, 8, bins);
    v = first_wrong(bins, want_many);
    CHECK("many values", v < 0, "bins[%d] should be %ld, but it is %ld", v, v < 0 ? 0 : want_many[v], v < 0 ? 0 : bins[v]);
    return 0;
}
