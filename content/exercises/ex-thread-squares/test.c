static int same(const int *a, const int *b, int n) {
    for (int i = 0; i < n; i++)
        if (a[i] != b[i]) return 0;
    return 1;
}

int main(void) {
    int in4[4] = {1, 2, 3, 4}, want4[4] = {1, 4, 9, 16}, out4[4] = {-1, -1, -1, -1};
    squares(in4, out4, 4);
    CHECK("four numbers", same(out4, want4, 4), "out should be {1, 4, 9, 16}, but it is {%d, %d, %d, %d}", out4[0], out4[1], out4[2], out4[3]);

    int in1[1] = {-7}, out1[1] = {-1};
    squares(in1, out1, 1);
    CHECK("one number", out1[0] == 49, "out[0] should be 49, but it is %d", out1[0]);

    int in8[8] = {0, 5, -3, 10, 7, 2, -11, 100}, want8[8] = {0, 25, 9, 100, 49, 4, 121, 10000};
    int out8[8] = {-1, -1, -1, -1, -1, -1, -1, -1};
    squares(in8, out8, 8);
    int bad = -1;
    for (int i = 0; i < 8; i++)
        if (out8[i] != want8[i]) { bad = i; break; }
    CHECK("eight numbers", bad < 0, "out[%d] should be %d, but it is %d", bad, bad < 0 ? 0 : want8[bad], bad < 0 ? 0 : out8[bad]);
    return 0;
}
