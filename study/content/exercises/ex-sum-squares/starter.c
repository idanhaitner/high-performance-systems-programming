/* Return 1*1 + 2*2 + ... + n*n. When n is 0, return 0. */
long long sum_squares(int n) {
    int total = 0; /* TODO: is an int big enough to hold this total? */
    for (int i = 1; i <= n; i++) {
        total = total + i * i;
    }
    return total;
}
