int main(void) {
    int x = 42;
    set_to_zero(&x);
    CHECK("positive number", x == 0, "x started at 42 and should now be 0, but it is %d", x);

    int y = -5;
    set_to_zero(&y);
    CHECK("negative number", y == 0, "y started at -5 and should now be 0, but it is %d", y);

    int a = 5;
    int b = 6;
    set_to_zero(&a);
    CHECK("only that variable", a == 0 && b == 6, "after set_to_zero(&a), a should be 0 and b should still be 6, but a is %d and b is %d", a, b);
    return 0;
}
