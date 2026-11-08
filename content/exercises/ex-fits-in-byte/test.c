int main(void) {
    CHECK("values that fit", fits_in_byte(0) == 1 && fits_in_byte(200) == 1 && fits_in_byte(255) == 1, "0, 200, and 255 all fit in a uint8_t, so each should give 1");
    CHECK("too big", fits_in_byte(256) == 0 && fits_in_byte(300) == 0, "256 and 300 do not fit in a uint8_t, so each should give 0");
    CHECK("negative", fits_in_byte(-1) == 0 && fits_in_byte(-200) == 0, "a uint8_t cannot hold a negative number, so -1 and -200 should give 0");
    return 0;
}
