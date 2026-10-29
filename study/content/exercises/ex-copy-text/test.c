/* Frees the copy, unless it is the original itself (the starter's mistake). */
static void drop(char *copy, char *original) {
    if (copy != original) free(copy);
}

int main(void) {
    char a[] = "Mili";
    char *c = copy_text(a);
    CHECK("a short name", c != NULL && c != a && strcmp(c, "Mili") == 0,
          "%s", c == NULL ? "got NULL instead of a copy"
              : c == a ? "the copy is the same block as the original; make a new one with malloc"
              : "the copy should read \"Mili\"");
    drop(c, a);

    char b[] = "Yehudit";
    c = copy_text(b);
    b[0] = 'X';
    CHECK("a separate block", c != NULL && c != b && strcmp(c, "Yehudit") == 0,
          "%s", c == NULL ? "got NULL instead of a copy"
              : "changing the original also changed the copy, so they share one block");
    drop(c, b);

    char e[] = "";
    c = copy_text(e);
    CHECK("the empty string", c != NULL && c != e && c[0] == '\0',
          "%s", c == NULL ? "got NULL instead of a copy"
              : c == e ? "the copy is the same block as the original; make a new one with malloc"
              : "the copy of \"\" should be \"\"");
    drop(c, e);

    char d[] = "Emanuel";
    c = copy_text(d);
    CHECK("a longer name", c != NULL && c != d && strcmp(c, "Emanuel") == 0,
          "%s", c == NULL ? "got NULL instead of a copy"
              : c == d ? "the copy is the same block as the original; make a new one with malloc"
              : "the copy should read \"Emanuel\"");
    drop(c, d);
    return 0;
}
