/* Return total divided by count, keeping the part after the decimal point.
   count is never 0 in the tests. */
double average(int total, int count) {
    double exact_total = total; /* 7 becomes 7.0 */
    return exact_total / count; /* a double on one side: decimal division */
}
