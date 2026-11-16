int main(void) {
    char a[] = "Hello World";
    lower(a);
    CHECK("mixed letters", strcmp(a, "hello world") == 0, "\"Hello World\" should become \"hello world\", but it is \"%s\"", a);

    char b[] = "ABC xyz 123!";
    lower(b);
    CHECK("other characters stay", strcmp(b, "abc xyz 123!") == 0, "\"ABC xyz 123!\" should become \"abc xyz 123!\", but it is \"%s\"", b);

    char c[] = "";
    lower(c);
    CHECK("empty string", c[0] == '\0', "an empty string should stay empty");
    return 0;
}
