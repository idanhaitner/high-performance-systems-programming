/* Return how many times letter appears in text. */
int count_letter(const char *text, char letter) {
    int count = 0;
    for (int i = 0; text[i] != '\0'; i++) {
        if (text[i] == letter)
            count = count + 1;
    }
    return count;
}
