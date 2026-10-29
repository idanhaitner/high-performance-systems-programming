int main(void) {
    int *a = NULL;
    int n = 0;
    a = append(a, &n, 10);
    a = append(a, &n, 20);
    a = append(a, &n, 30);
    CHECK("from empty", n == 3 && a != NULL && a[0] == 10 && a[1] == 20 && a[2] == 30,
          "after appending 10, 20, 30 the count should be 3 and the array {10, 20, 30}, but the count is %d", n);
    free(a);

    int m = 3;
    int *b = malloc(3 * sizeof(int));
    b[0] = 1;
    b[1] = 2;
    b[2] = 3;
    b = append(b, &m, 4);
    CHECK("onto an existing array", m == 4 && b[0] == 1 && b[1] == 2 && b[2] == 3 && b[3] == 4,
          "appending 4 to {1, 2, 3} should give count 4 and {1, 2, 3, 4}, but the count is %d", m);
    free(b);

    int *c = NULL;
    int k = 0;
    for (int i = 0; i < 100; i++)
        c = append(c, &k, i);
    int ok = k == 100 && c != NULL;
    for (int i = 0; ok && i < 100; i++)
        if (c[i] != i) ok = 0;
    CHECK("many appends", ok, "after appending 0 to 99 the count should be 100 and c[i] should equal i, but the count is %d", k);
    free(c);
    return 0;
}
