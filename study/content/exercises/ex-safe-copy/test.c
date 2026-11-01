int main(void) {
    char a[8];
    safe_copy(a, 8, "Dana");
    CHECK("short text fits", strcmp(a, "Dana") == 0, "copying Dana into 8 bytes should give Dana");

    char b[8];
    safe_copy(b, 8, "1234567");
    CHECK("exactly full", strcmp(b, "1234567") == 0, "7 letters and the ending 0 exactly fill 8 bytes, so all 7 letters should be copied");

    struct { char text[8]; char guard[4]; } c;
    strcpy(c.guard, "OK!");
    safe_copy(c.text, 8, "AAAAAAAAAAAAAAA");
    int ended = memchr(c.text, '\0', 8) != NULL;
    CHECK("long text is cut", ended && strcmp(c.text, "AAAAAAA") == 0 && strcmp(c.guard, "OK!") == 0, "a long text should be cut to 7 letters and the ending 0, with no byte written past the 8");
    return 0;
}
