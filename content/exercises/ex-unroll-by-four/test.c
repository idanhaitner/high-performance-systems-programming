static int scaled_ok(const int *a, const int *b, int n) {
    for (int i = 0; i < n; i++)
        if (b[i] != a[i] * 3 + 7)
            return 0;
    return 1;
}

int main(void) {
    int a[9] = {0, 1, 2, 3, 4, 5, 6, 7, 8};
    int b[9];
    for (int i = 0; i < 9; i++) b[i] = -1;
    scale(a, b, 8);
    CHECK("multiple of four", scaled_ok(a, b, 8), "with n = 8, every b[i] should be a[i] * 3 + 7");

    for (int i = 0; i < 9; i++) b[i] = -1;
    scale(a, b, 7);
    CHECK("three left over", scaled_ok(a, b, 7), "with n = 7, every b[i] should be a[i] * 3 + 7, including b[4], b[5], and b[6]");

    for (int i = 0; i < 9; i++) b[i] = -1;
    scale(a, b, 3);
    CHECK("fewer than four", scaled_ok(a, b, 3), "with n = 3, b should be {7, 10, 13}, but it is {%d, %d, %d}", b[0], b[1], b[2]);

    for (int i = 0; i < 9; i++) b[i] = -1;
    scale(a, b, 5);
    CHECK("nothing past the end", scaled_ok(a, b, 5) && b[5] == -1 && b[6] == -1 && b[7] == -1 && b[8] == -1,
          "with n = 5, b[0] to b[4] should be set and b[5] to b[8] should stay -1, but b[5] is %d", b[5]);
    return 0;
}
