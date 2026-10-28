int main(void) {
    int got;

    struct student last[3] = {{"Dana", 1, 70}, {"Omer", 2, 85}, {"Noa", 3, 92}};
    got = best_index(last, 3);
    CHECK("best is last", got == 2,
          "grades are 70, 85, 92, so the answer is index 2 (Noa), but best_index returned %d", got);

    struct student first[3] = {{"Moshe", 4, 99}, {"Eden", 5, 60}, {"Lior", 6, 75}};
    got = best_index(first, 3);
    CHECK("best is first", got == 0,
          "grades are 99, 60, 75, so the answer is index 0 (Moshe), but best_index returned %d", got);

    struct student tie[4] = {{"Tal", 7, 80}, {"Yael", 8, 95}, {"Ron", 9, 95}, {"Gil", 10, 50}};
    got = best_index(tie, 4);
    CHECK("tie keeps the first", got == 1,
          "grades are 80, 95, 95, 50, so the answer is index 1 (Yael, the first 95), but best_index returned %d", got);
    return 0;
}
