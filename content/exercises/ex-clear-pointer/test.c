int main(void) {
    int a = 1;
    int *p = &a;
    clear_pointer(&p);
    CHECK("pointer becomes NULL", p == NULL, "after the call, p should be NULL, but it still points somewhere");
    CHECK("the number stays", a == 1, "a should still be 1, but it is %d", a);

    int b = 2;
    int *q = &b;
    int *r = &b;
    clear_pointer(&q);
    CHECK("only that pointer", q == NULL && r == &b, "only q should become NULL; r should still point to b");
    return 0;
}
