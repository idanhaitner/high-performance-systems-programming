int main(void) {
    next_offset = 0;
    void *a = my_malloc(5);
    CHECK("first block starts the arena", a == (void *)&arena[0] && next_offset == 5,
          "the first block should start at arena[0] and next_offset should be 5, but next_offset is %zu", next_offset);

    void *b = my_malloc(8);
    CHECK("skips to a multiple of 8", b == (void *)&arena[8] && next_offset == 16,
          "after 5 bytes, the next block should start at arena[8] and next_offset should be 16, but next_offset is %zu", next_offset);

    next_offset = 0;
    my_malloc(8);
    void *c = my_malloc(8);
    CHECK("no skip when already aligned", c == (void *)&arena[8] && next_offset == 16,
          "after 8 bytes, the next block should start at arena[8] with no gap, but next_offset is %zu", next_offset);

    next_offset = 0;
    my_malloc(5);
    void *d = my_malloc(57);
    CHECK("too big after padding", d == NULL && next_offset == 5,
          "after 5 bytes, 3 bytes of padding leave 56 bytes, so a block of 57 should give NULL and leave next_offset at 5, but next_offset is %zu", next_offset);

    next_offset = 0;
    CHECK("zero bytes", my_malloc(0) == NULL && next_offset == 0, "asking for 0 bytes should give NULL and change nothing");
    return 0;
}
