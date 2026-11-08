typedef struct {
    char letter;
    int number;
} Pair;

int main(void) {
    int x = 10, y = 20;
    generic_swap(&x, &y, sizeof x);
    CHECK("swaps ints", x == 20 && y == 10, "after swapping 10 and 20, x is %d and y is %d", x, y);

    double p = 1.5, q = 9.25;
    generic_swap(&p, &q, sizeof p);
    CHECK("swaps doubles", p == 9.25 && q == 1.5, "after swapping 1.5 and 9.25, p is %.2f and q is %.2f", p, q);

    unsigned char a[4] = {1, 2, 3, 4};
    unsigned char b[4] = {5, 6, 7, 8};
    generic_swap(a, b, 2);
    CHECK("swaps only size bytes", a[0] == 5 && a[1] == 6 && a[2] == 3 && a[3] == 4 && b[0] == 1 && b[1] == 2 && b[2] == 7 && b[3] == 8,
          "with size 2, a should be {5, 6, 3, 4} and b should be {1, 2, 7, 8}, but a is {%d, %d, %d, %d} and b is {%d, %d, %d, %d}",
          a[0], a[1], a[2], a[3], b[0], b[1], b[2], b[3]);

    Pair u = {'a', 100};
    Pair v = {'z', -5};
    generic_swap(&u, &v, sizeof u);
    CHECK("swaps a structure", u.letter == 'z' && u.number == -5 && v.letter == 'a' && v.number == 100,
          "both members of each structure should trade places, but u is {%c, %d} and v is {%c, %d}", u.letter, u.number, v.letter, v.number);
    return 0;
}
