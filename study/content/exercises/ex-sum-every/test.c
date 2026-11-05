int main(void) {
    int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    long v = sum_every(a, 10, 1);
    CHECK("stride 1", v == 55, "with stride 1 every number is added, so the sum should be 55, but you returned %ld", v);

    v = sum_every(a, 10, 3);
    CHECK("stride 3", v == 22, "with stride 3 you add a[0], a[3], a[6], and a[9], which are 1, 4, 7, and 10, so the sum should be 22, but you returned %ld", v);

    v = sum_every(a, 10, 20);
    CHECK("stride bigger than the array", v == 1, "with stride 20 only a[0] is below n, so the sum should be 1, but you returned %ld", v);
    return 0;
}
