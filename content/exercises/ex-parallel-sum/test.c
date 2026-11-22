int main(void) {
    int a[10] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    long long s = parallel_sum(a, 10, 4);
    CHECK("ten numbers, four threads", s == 55, "the sum of 1 to 10 should be 55, but it is %lld", s);

    s = parallel_sum(a, 10, 1);
    CHECK("one thread", s == 55, "with one thread the sum should still be 55, but it is %lld", s);

    int b[3] = {5, 5, 5};
    s = parallel_sum(b, 3, 8);
    CHECK("more threads than numbers", s == 15, "the sum of {5, 5, 5} with 8 threads should be 15, but it is %lld", s);

    static int big[100000];
    for (int i = 0; i < 100000; i++) big[i] = 100000;
    s = parallel_sum(big, 100000, 6);
    CHECK("big sum", s == 10000000000LL, "100000 copies of 100000 should add up to 10000000000, but the sum is %lld", s);
    return 0;
}
