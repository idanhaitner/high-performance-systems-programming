int main(void) {
    size_t r = padding_for(5, 8);
    CHECK("in the middle", r == 3, "padding_for(5, 8) should be 3, but it is %zu", r);
    r = padding_for(16, 8);
    CHECK("already aligned", r == 0, "16 already is a multiple of 8, so padding_for(16, 8) should be 0, but it is %zu", r);
    r = padding_for(0, 8);
    CHECK("from zero", r == 0, "padding_for(0, 8) should be 0, but it is %zu", r);
    size_t a = padding_for(13, 4);
    size_t b = padding_for(1, 16);
    CHECK("other alignments", a == 3 && b == 15, "padding_for(13, 4) should be 3 and padding_for(1, 16) should be 15, but they are %zu and %zu", a, b);
    return 0;
}
