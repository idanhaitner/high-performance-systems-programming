int count_if(int *a, int n, int (*keep)(int)) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (keep(a[i])) /* call the function we were given */
            count++;
    }
    return count;
}
