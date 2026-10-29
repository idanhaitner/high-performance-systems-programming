/* Says where p points, as an index into arr, for the failure messages. */
static const char *where(int *p, int *arr, int n) {
    static char text[40];
    if (p == NULL) return "still NULL";
    for (int i = 0; i < n; i++) {
        if (p == &arr[i]) {
            snprintf(text, sizeof(text), "pointing to a[%d]", i);
            return text;
        }
    }
    return "pointing outside the array";
}

int main(void) {
    int *p;

    int a1[] = {4, 9, 2};
    p = NULL;
    point_to_max(&p, a1, 3);
    CHECK("largest in the middle", p == &a1[1],
          "p should point to a[1] (the 9), but it is %s", where(p, a1, 3));

    int a2[] = {1, 5, 8};
    p = NULL;
    point_to_max(&p, a2, 3);
    CHECK("largest at the end", p == &a2[2],
          "p should point to a[2] (the 8), but it is %s", where(p, a2, 3));

    int a3[] = {-7, -3, -9};
    p = NULL;
    point_to_max(&p, a3, 3);
    CHECK("all negative", p == &a3[1],
          "p should point to a[1] (the -3), but it is %s", where(p, a3, 3));

    int a4[] = {6, 2, 6};
    p = NULL;
    point_to_max(&p, a4, 3);
    if (p == &a4[0]) *p = 0;
    CHECK("tie keeps the first", p == &a4[0] && a4[0] == 0,
          "p should point to a[0] (the first 6), but it is %s", where(p, a4, 3));
    return 0;
}
