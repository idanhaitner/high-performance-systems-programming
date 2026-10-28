int main(void) {
    int got = next_ticket();
    CHECK("first call is 1", got == 1, "the first call should return 1, but it returned %d", got);

    got = next_ticket();
    CHECK("counts up", got == 2, "the second call should return 2, but it returned %d", got);

    for (int i = 0; i < 10; i++) {
        got = next_ticket();
    }
    CHECK("ten calls", got == 12, "after two calls, ten more calls should end at 12, but the last one returned %d", got);
    return 0;
}
