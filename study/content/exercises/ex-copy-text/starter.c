#include <stdlib.h> /* malloc */
#include <string.h> /* strlen, strcpy */

/* Return a new heap block holding a copy of text, exactly strlen(text) + 1 bytes.
   The caller frees it. */
char *copy_text(char *text) {
    /* TODO: reserve strlen(text) + 1 bytes with malloc,
       copy text into them with strcpy, and return the new block. */
    return text; /* wrong: this is the same block, not a copy */
}
