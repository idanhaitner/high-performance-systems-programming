int main(void) {
    int r = digit_value('7');
    CHECK("seven", r == 7, "digit_value('7') should be 7, but you returned %d", r);
    r = digit_value('0');
    CHECK("zero", r == 0, "digit_value('0') should be 0, but you returned %d", r);
    r = digit_value('9');
    CHECK("nine", r == 9, "digit_value('9') should be 9, but you returned %d", r);
    return 0;
}
