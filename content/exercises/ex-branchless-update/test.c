int main(void) {
    uint32_t a1[3] = {10, 20, 30};
    uint32_t b1[3] = {100, 100, 100};
    update(a1, b1, 3);
    CHECK("small values are subtracted", b1[0] == 90 && b1[1] == 80 && b1[2] == 70,
          "b should be {90, 80, 70}, but it is {%u, %u, %u}", (unsigned)b1[0], (unsigned)b1[1], (unsigned)b1[2]);

    uint32_t a2[2] = {4000000000u, 3000000000u};
    uint32_t b2[2] = {5, 7};
    update(a2, b2, 2);
    CHECK("big values are added", b2[0] == 4000000005u && b2[1] == 3000000007u,
          "b should be {4000000005, 3000000007}, but it is {%u, %u}", (unsigned)b2[0], (unsigned)b2[1]);

    uint32_t a3[1] = {5};
    uint32_t b3[1] = {1};
    update(a3, b3, 1);
    CHECK("subtracting wraps around", b3[0] == 4294967292u,
          "1 - 5 should wrap around to 4294967292, but b[0] is %u", (unsigned)b3[0]);
    return 0;
}
