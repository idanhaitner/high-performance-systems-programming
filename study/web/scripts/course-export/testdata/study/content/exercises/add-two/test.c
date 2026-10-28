int main(void) {
    CHECK("positives", add(1, 2) == 3, "got %d", add(1, 2));
    CHECK("negatives", add(-1, -2) == -3, "got %d", add(-1, -2));
    return 0;
}
