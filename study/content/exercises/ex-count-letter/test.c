int main(void) {
    int r = count_letter("banana", 'a');
    CHECK("several", r == 3, "\"banana\" has 3 a's, but you returned %d", r);
    r = count_letter("hello", 'z');
    CHECK("not there", r == 0, "\"hello\" has no z, but you returned %d", r);
    r = count_letter("", 'a');
    CHECK("empty text", r == 0, "the empty string has no letters, but you returned %d", r);
    r = count_letter("Aa", 'a');
    CHECK("capitals are different", r == 1, "\"Aa\" has one small a, but you returned %d", r);
    return 0;
}
