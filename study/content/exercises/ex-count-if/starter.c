/* Count how many of the n elements of a make keep(element) return non-zero.
   keep is a pointer to a function that receives an int and returns an int. */
int count_if(int *a, int n, int (*keep)(int)) {
    int count = 0;
    /* TODO: loop over a[0] .. a[n - 1], call keep on each element,
       and add 1 to count every time keep returns something other than 0. */
    return count;
}
