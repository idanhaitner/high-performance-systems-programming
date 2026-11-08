void safe_copy(char *dest, int size, const char *src) {
    int i = 0;
    while (i < size - 1 && src[i] != '\0') {
        dest[i] = src[i];
        i++;
    }
    dest[i] = '\0';
}
