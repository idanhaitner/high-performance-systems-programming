/* Says where r points, as an index into a, for the failure messages. */
static const char *where(int *r, int *a) {
    static char text[40];
    if (r == NULL) return "NULL";
    snprintf(text, sizeof(text), "the address of a[%td]", r - a);
    return text;
}

int main(void) {
    int a[] = {7, 3, 9, 3};
    int *r;

    r = find_first(a, 4, 3);
    CHECK("match in the middle", r == &a[1], "should be the address of a[1], but it is %s", where(r, a));

    r = find_first(a, 4, 7);
    CHECK("match at the start", r == &a[0], "should be the address of a[0], but it is %s", where(r, a));

    r = find_first(a, 4, 5);
    CHECK("no match", r == NULL, "5 is not in the array, so the answer should be NULL, but it is %s", where(r, a));

    r = find_first(a, 0, 7);
    CHECK("empty array", r == NULL, "with n = 0 the answer should be NULL, but it is %s", where(r, a));
    return 0;
}
