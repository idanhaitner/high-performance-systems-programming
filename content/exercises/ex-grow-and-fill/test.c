int main(void) {
    int *a = malloc(2 * sizeof(int));
    a[0] = 1;
    a[1] = 2;
    a = grow_and_fill(a, 2, 4, 7);
    CHECK("keeps the old values", a != NULL && a[0] == 1 && a[1] == 2, "growing {1, 2} should keep 1 and 2 at the start");
    CHECK("fills the new places", a != NULL && a[2] == 7 && a[3] == 7, "growing {1, 2} to 4 elements with fill 7 should give {1, 2, 7, 7}");
    free(a);

    int *b = malloc(sizeof(int));
    b[0] = 5;
    b = grow_and_fill(b, 1, 1000, -1);
    int ok = b != NULL && b[0] == 5;
    for (int i = 1; ok && i < 1000; i++)
        if (b[i] != -1) ok = 0;
    CHECK("grows a lot", ok, "growing to 1000 elements should keep b[0] and put -1 in every new place");
    free(b);
    return 0;
}
