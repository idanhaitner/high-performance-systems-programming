#include <stddef.h>

typedef struct Box Box;
struct Box {
    void *data;
    double (*to_double)(const Box *self);
};

double total(const Box *boxes, int n) {
    return 0;
}
