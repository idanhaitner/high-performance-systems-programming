int main(void) {
    int r;

    r = compare_text("cat", "cat");
    CHECK("equal strings", r == 0, "compare_text(\"cat\", \"cat\") should be 0, but it is %d", r);

    r = compare_text("aab", "aaa");
    CHECK("differ in the last letter", r > 0, "compare_text(\"aab\", \"aaa\") should be positive, but it is %d", r);

    r = compare_text("aaa", "aaaaa");
    CHECK("one is shorter", r < 0, "compare_text(\"aaa\", \"aaaaa\") should be negative, but it is %d", r);

    int empty_first = compare_text("", "a");
    int empty_second = compare_text("a", "");
    CHECK("the empty string", empty_first < 0 && empty_second > 0,
          "compare_text(\"\", \"a\") should be negative and compare_text(\"a\", \"\") positive, but they are %d and %d",
          empty_first, empty_second);
    return 0;
}
