int main(void) {
    long t = pipeline_ticks(10, 5);
    CHECK("ten instructions", t == 14, "pipeline_ticks(10, 5) should be 14, but it is %ld", t);

    t = pipeline_ticks(1, 5);
    CHECK("one instruction", t == 5, "pipeline_ticks(1, 5) should be 5, but it is %ld", t);

    t = pipeline_ticks(0, 5);
    CHECK("no instructions", t == 0, "pipeline_ticks(0, 5) should be 0, but it is %ld", t);

    t = pipeline_ticks(1000000, 5);
    CHECK("a million instructions", t == 1000004, "pipeline_ticks(1000000, 5) should be 1000004, but it is %ld", t);
    return 0;
}
