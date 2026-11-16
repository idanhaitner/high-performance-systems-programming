static int close_to(double a, double b) {
    double d = a - b;
    return d < 1e-9 && d > -1e-9;
}

int main(void) {
    double t = new_total(100, 0.10, 10);
    CHECK("small part, big speedup", close_to(t, 91), "new_total(100, 0.10, 10) should be 91, but it is %g", t);

    t = new_total(100, 0.75, 2);
    CHECK("big part, small speedup", close_to(t, 62.5), "new_total(100, 0.75, 2) should be 62.5, but it is %g", t);

    t = new_total(40, 0.5, 1);
    CHECK("no speedup", close_to(t, 40), "new_total(40, 0.5, 1) should be 40, but it is %g", t);
    return 0;
}
