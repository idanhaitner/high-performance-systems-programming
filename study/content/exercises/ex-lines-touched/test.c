int main(void) {
    size_t v = lines_touched(60, 4);
    CHECK("inside one line", v == 1, "4 bytes from address 60 are addresses 60 to 63, all in line 0, so the answer is 1, but you returned %zu", v);

    v = lines_touched(62, 4);
    CHECK("split int", v == 2, "4 bytes from address 62 are addresses 62 to 65, which cross from line 0 into line 1, so the answer is 2, but you returned %zu", v);

    v = lines_touched(0, 64);
    CHECK("a whole line", v == 1, "64 bytes from address 0 are addresses 0 to 63, exactly line 0, so the answer is 1, but you returned %zu", v);

    v = lines_touched(32, 128);
    CHECK("a long range", v == 3, "128 bytes from address 32 are addresses 32 to 159, in lines 0, 1, and 2, so the answer is 3, but you returned %zu", v);
    return 0;
}
