int main(void) {
    int *a = make_zeros(5);
    int ok = a != NULL;
    for (int i = 0; ok && i < 5; i++)
        if (a[i] != 0) ok = 0;
    CHECK("five zeros", ok, "make_zeros(5) should return 5 ints that are all 0");

    int *b = make_zeros(1);
    CHECK("one zero", b != NULL && b[0] == 0, "make_zeros(1) should return 1 int that is 0");

    int *c = make_zeros(3);
    int *d = make_zeros(3);
    ok = c != NULL && d != NULL && c != d;
    if (ok) {
        c[0] = 9;
        ok = d[0] == 0;
    }
    CHECK("separate blocks", ok, "two calls should return two separate blocks, so writing to one must not change the other");

    free(a);
    free(b);
    free(c);
    free(d);
    return 0;
}
