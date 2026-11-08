static double int_value(const Box *self) { return *(const int *)self->data; }
static double double_value(const Box *self) { return *(const double *)self->data; }
static double int_times_ten(const Box *self) { return 10.0 * *(const int *)self->data; }

int main(void) {
    int a = 3, c = -1;
    double b = 2.5;
    Box mixed[3] = {{&a, int_value}, {&b, double_value}, {&c, int_value}};
    double r = total(mixed, 3);
    CHECK("adds mixed boxes", r == 4.5, "3 + 2.5 + -1 is 4.5, but total returned %.2f", r);

    int v = 7;
    Box same[2] = {{&v, int_value}, {&v, int_times_ten}};
    r = total(same, 2);
    CHECK("uses each box's own function", r == 77.0, "the first box gives 7 and the second gives 70, so the total is 77, but total returned %.2f", r);

    r = total(mixed, 0);
    CHECK("no boxes", r == 0.0, "an empty list should add up to 0, but total returned %.2f", r);
    return 0;
}
