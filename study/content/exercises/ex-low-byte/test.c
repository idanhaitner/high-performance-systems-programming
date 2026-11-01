int main(void) {
    CHECK("a value that fits", low_byte(65) == 65, "low_byte(65) should be 65, because 65 fits in one byte");
    CHECK("300 is cut down", low_byte(300) == 44, "low_byte(300) should be 44, which is 300 - 256");
    CHECK("256 is cut down", low_byte(256) == 0 && low_byte(257) == 1, "low_byte(256) should be 0 and low_byte(257) should be 1");
    return 0;
}
