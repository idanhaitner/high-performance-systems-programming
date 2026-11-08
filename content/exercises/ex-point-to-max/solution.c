void point_to_max(int **pp, int *arr, int n) {
    int *best = &arr[0]; /* points to the largest element seen so far */

    for (int i = 1; i < n; i++) {
        if (arr[i] > *best) /* > keeps the first of two equal values */
            best = &arr[i];
    }

    *pp = best; /* change the caller's pointer itself */
}
