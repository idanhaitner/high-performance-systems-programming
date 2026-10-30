/* Call f on x and return the answer. */
int apply(int (*f)(int), int x) {
    return f(x);
}
