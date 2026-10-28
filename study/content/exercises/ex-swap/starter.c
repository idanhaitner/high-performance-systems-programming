/* Swap the two ints that a and b point to.
   After swap(&x, &y), x holds y's old value and y holds x's old value. */
void swap(int *a, int *b) {
    int x = *a; /* a copy of the first value */
    int y = *b; /* a copy of the second value */
    int old_x = x;

    /* TODO: these lines swap only the copies x and y.
       Change the boxes that a and b point to instead. */
    x = y;
    y = old_x;
}
