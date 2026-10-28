/* Swap the two ints that a and b point to.
   After swap(&x, &y), x holds y's old value and y holds x's old value. */
void swap(int *a, int *b) {
    int old_a = *a; /* save the first value before overwriting it */
    *a = *b;        /* the first box gets the second value */
    *b = old_a;     /* the second box gets the saved first value */
}
