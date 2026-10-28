/* Return 1*1 + 2*2 + ... + n*n. When n is 0, return 0. */
long long sum_squares(int n) {
    long long total = 0; /* 8 bytes: room for totals far above 2.1 billion */
    for (long long i = 1; i <= n; i++) {
        total = total + i * i; /* i is a long long too, so i * i cannot overflow an int */
    }
    return total;
}
