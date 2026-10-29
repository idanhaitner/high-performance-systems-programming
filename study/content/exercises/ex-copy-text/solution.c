#include <stdlib.h> /* malloc */
#include <string.h> /* strlen, strcpy */

/* Return a new heap block holding a copy of text, exactly strlen(text) + 1 bytes.
   The caller frees it. */
char *copy_text(char *text) {
    char *copy = malloc(strlen(text) + 1); /* the letters plus '\0' */
    if (copy == NULL)
        return NULL;
    strcpy(copy, text); /* copies the '\0' too */
    return copy;
}
