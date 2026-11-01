int main(void) {
    int three[3] = {0, 0, 0};
    fill_numbers(three, 3);
    CHECK("three numbers", three[0] == 10 && three[1] == 20 && three[2] == 30, "after fill_numbers(three, 3), the array should hold 10, 20, 30");

    int one[1] = {0};
    fill_numbers(one, 1);
    CHECK("one number", one[0] == 10, "after fill_numbers(one, 1), the array should hold 10");

    int guarded[4] = {0, 0, -1, -1};
    fill_numbers(guarded, 2);
    CHECK("stays inside n", guarded[0] == 10 && guarded[1] == 20 && guarded[2] == -1 && guarded[3] == -1, "fill_numbers(guarded, 2) should change only the first 2 elements");
    return 0;
}
