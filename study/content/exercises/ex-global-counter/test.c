int main(void) {
    count_call();
    CHECK("one call", total_calls == 1, "after one call, total_calls should be 1, but it is %d", total_calls);
    count_call();
    count_call();
    CHECK("three calls", total_calls == 3, "after three calls, total_calls should be 3, but it is %d", total_calls);
    total_calls = 10;
    count_call();
    CHECK("adds to the current value", total_calls == 11, "total_calls was set to 10, so one more call should make it 11, but it is %d", total_calls);
    return 0;
}
