// Lesson 10 — structs.
// From this directory:  make run LESSON=10-structs

#include <stdio.h>
#include <stddef.h>

struct sample {
    char name[8];
    int id;
};

struct point {
    int x;
    int y;
};

int main(void) {
    struct point p;
    p.x = 2;
    p.y = 5;
    printf("point is (%d, %d)\n", p.x, p.y);
    printf("sizeof(struct point) = %zu\n", sizeof(struct point));
    printf("offset of y = %zu\n", offsetof(struct point, y));

    struct sample s = {"Ada", 1111};
    printf("sample name starts with %c\n", s.name[0]);
    printf("sizeof(struct sample) = %zu\n", sizeof(struct sample));
    printf("offset of id = %zu\n", offsetof(struct sample, id));

    struct point copy = p;
    copy.x = 9;
    printf("after editing the copy, p.x = %d\n", p.x);

    return 0;
}
