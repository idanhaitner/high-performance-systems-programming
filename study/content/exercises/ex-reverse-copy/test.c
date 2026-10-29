/* Writes the n ints at r as {a, b, c} for the failure messages. */
static const char *show(int *r, int n) {
    static char text[80];
    if (r == NULL) return "NULL; return the new array";
    int used = snprintf(text, sizeof(text), "{");
    for (int i = 0; i < n; i++)
        used += snprintf(text + used, sizeof(text) - used, i == 0 ? "%d" : ", %d", r[i]);
    snprintf(text + used, sizeof(text) - used, "}");
    return text;
}

int main(void) {
    int a[] = {1, 2, 3};
    int *r = reverse_copy(a, 3);
    CHECK("three numbers", r != NULL && r[0] == 3 && r[1] == 2 && r[2] == 1,
          "the copy should be {3, 2, 1}, but it is %s", show(r, 3));
    free(r);

    int b[] = {4, 5, 6, 7};
    r = reverse_copy(b, 4);
    CHECK("original unchanged", r != NULL && b[0] == 4 && b[1] == 5 && b[2] == 6 && b[3] == 7,
          "the original should still be {4, 5, 6, 7}, and the result must not be NULL; the original is %s and the result is %s",
          show(b, 4), r == NULL ? "NULL" : "an array");
    free(r);

    int c[] = {9};
    r = reverse_copy(c, 1);
    CHECK("one number", r != NULL && r[0] == 9, "the copy should be {9}, but it is %s", show(r, 1));
    free(r);
    return 0;
}
