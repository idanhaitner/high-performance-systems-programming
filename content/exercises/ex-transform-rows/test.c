int main(void) {
    float src[8] = {0, 1, 2, 3, 4, 5, 6, 7};
    float dst[8];
    for (int i = 0; i < 8; i++) dst[i] = -1;
    transform(2, 3, src, dst);
    int ok = 1;
    for (int i = 0; i < 6; i++)
        if (dst[i] != 3.0f * src[i] + 2.0f) ok = 0;
    CHECK("two by three", ok, "dst should be {2, 5, 8, 11, 14, 17}, but it is {%g, %g, %g, %g, %g, %g}",
          dst[0], dst[1], dst[2], dst[3], dst[4], dst[5]);

    float row[4] = {-1, -1, -1, -1};
    transform(1, 4, src, row);
    CHECK("one row", row[0] == 2 && row[1] == 5 && row[2] == 8 && row[3] == 11,
          "a 1 by 4 table should become {2, 5, 8, 11}, but it is {%g, %g, %g, %g}", row[0], row[1], row[2], row[3]);

    for (int i = 0; i < 8; i++) dst[i] = -1;
    transform(3, 2, src, dst);
    CHECK("nothing past the end", dst[5] == 17 && dst[6] == -1 && dst[7] == -1,
          "with 3 rows of 2, positions 0 to 5 change and positions 6 and 7 stay -1, but dst[5] is %g and dst[6] is %g", dst[5], dst[6]);
    return 0;
}
