long pipeline_ticks(long n, int steps) {
    if (n == 0)
        return 0;
    return steps + (n - 1);
}
