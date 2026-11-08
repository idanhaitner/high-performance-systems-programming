int main(void) {
    next_offset = 0;
    void *a = my_malloc(8);
    CHECK("first block starts the arena", a == (void *)&arena[0] && next_offset == 8,
          "the first block should start at arena[0] and next_offset should be 8, but next_offset is %zu", next_offset);

    void *b = my_malloc(16);
    void *c = my_malloc(4);
    CHECK("blocks follow each other", b == (void *)&arena[8] && c == (void *)&arena[24] && next_offset == 28,
          "the blocks should start at arena[8] and arena[24], and next_offset should be 28, but it is %zu", next_offset);

    void *d = my_malloc(37);
    CHECK("too big returns NULL and changes nothing", d == NULL && next_offset == 28,
          "only 36 bytes are free, so asking for 37 should give NULL and leave next_offset at 28, but it is %zu", next_offset);

    void *e = my_malloc(36);
    CHECK("uses every last byte", e == (void *)&arena[28] && next_offset == 64,
          "asking for exactly the 36 free bytes should work and make next_offset 64, but next_offset is %zu", next_offset);

    next_offset = 0;
    CHECK("zero bytes", my_malloc(0) == NULL, "asking for 0 bytes should give NULL");
    return 0;
}
