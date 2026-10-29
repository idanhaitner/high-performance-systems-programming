/* Count how many of the n elements of a make keep(element) return non-zero.
   keep is a pointer to a function that receives an int and returns an int. */
int count_if(int *a, int n, int (*keep)(int)) {
    int count = 0;
    for (int i = 0; i < n; i++) {
        if (keep(a[i])) /* call the function we were given */
            count++;
    }
    return count;
}
