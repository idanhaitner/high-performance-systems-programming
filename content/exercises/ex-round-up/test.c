int main(void) {
    size_t v = round_up(5, 4);
    CHECK("needs padding", v == 8, "round_up(5, 4) should be 8, but you returned %zu", v);

    v = round_up(8, 4);
    CHECK("already aligned", v == 8, "8 is already a multiple of 4, so round_up(8, 4) should be 8, but you returned %zu", v);

    v = round_up(0, 8);
    CHECK("zero", v == 0, "round_up(0, 8) should be 0, but you returned %zu", v);

    v = round_up(13, 8);
    CHECK("bigger boundary", v == 16, "round_up(13, 8) should be 16, but you returned %zu", v);
    return 0;
}
