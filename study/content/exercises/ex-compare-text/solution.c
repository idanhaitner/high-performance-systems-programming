int compare_text(char a[], char b[]) {
    int i = 0;
    while (a[i] != '\0' && a[i] == b[i]) /* stop at the first difference or the end */
        i++;
    return a[i] - b[i];
}
