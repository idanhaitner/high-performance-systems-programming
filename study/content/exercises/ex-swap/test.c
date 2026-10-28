int main(void) {
    int x;
    int y;

    x = 3;
    y = 8;
    swap(&x, &y);
    CHECK("two positives", x == 8 && y == 3,
          "after swap, x should be 8 and y should be 3, but x is %d and y is %d", x, y);

    x = -4;
    y = 9;
    swap(&x, &y);
    CHECK("negative and positive", x == 9 && y == -4,
          "after swap, x should be 9 and y should be -4, but x is %d and y is %d", x, y);

    x = 6;
    y = 6;
    swap(&x, &y);
    CHECK("same value", x == 6 && y == 6,
          "after swap, x and y should both still be 6, but x is %d and y is %d", x, y);
    return 0;
}
