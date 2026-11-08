#include <stdlib.h>
#include <string.h>

char *copy_text(char *text) {
    char *copy = malloc(strlen(text) + 1); /* the letters plus '\0' */
    if (copy == NULL)
        return NULL;
    strcpy(copy, text); /* copies the '\0' too */
    return copy;
}
