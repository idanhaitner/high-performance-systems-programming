#include <stddef.h>

typedef struct Box Box;
struct Box {
    void *data;
    double (*to_double)(const Box *self);
};

double total(const Box *boxes, int n) {
    double sum = 0;
    for (int i = 0; i < n; i++)
        sum += boxes[i].to_double(&boxes[i]);
    return sum;
}
