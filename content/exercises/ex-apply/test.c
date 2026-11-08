static int twice(int x) { return x * 2; }
static int negate(int x) { return -x; }
static int add_ten(int x) { return x + 10; }

int main(void) {
    int r = apply(twice, 5);
    CHECK("calls twice", r == 10, "twice(5) is 10, but you returned %d", r);
    r = apply(negate, 4);
    CHECK("calls negate", r == -4, "negate(4) is -4, but you returned %d", r);
    r = apply(add_ten, 1);
    CHECK("calls add_ten", r == 11, "add_ten(1) is 11, but you returned %d", r);
    return 0;
}
