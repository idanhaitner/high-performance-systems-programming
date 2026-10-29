/* Make the caller's pointer (*pp) point to the largest element of arr.
   arr has n elements, n >= 1. If the largest value appears twice, pick the first. */
void point_to_max(int **pp, int *arr, int n) {
    int *best = &arr[0]; /* points to the largest element seen so far */

    for (int i = 1; i < n; i++) {
        /* TODO: if arr[i] is larger than the value best points to,
           make best point to arr[i]. */
    }

    /* TODO: hand best back to the caller through pp. */
}
