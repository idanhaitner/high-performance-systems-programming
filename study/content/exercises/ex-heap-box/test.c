int main(void) {
    int *a = make_box(5);
    CHECK("keeps the value", a != NULL && *a == 5, "make_box(5) should return the address of an int holding 5");

    int *b = make_box(6);
    int separate = a != NULL && b != NULL && a != b;
    CHECK("two separate boxes", separate && *a == 5 && *b == 6, "two calls should give two different addresses that hold 5 and 6");

    int *c = make_box(-1);
    int third = separate && c != NULL && c != a && c != b;
    CHECK("a negative value", third && *c == -1, "make_box(-1) should return a new box holding -1");

    if (third) {
        free(a);
        free(b);
        free(c);
    }
    return 0;
}
