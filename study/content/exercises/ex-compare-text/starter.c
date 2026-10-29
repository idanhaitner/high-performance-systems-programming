/* Compare strings a and b letter by letter, like strcmp:
   0 if equal, negative if a comes first, positive if b comes first. */
int compare_text(char a[], char b[]) {
    int i = 0;
    /* TODO: move i forward while a[i] is not '\0' and a[i] equals b[i]. */
    return a[i] - b[i];
}
