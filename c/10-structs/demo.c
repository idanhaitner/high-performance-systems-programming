// Lesson 10 — structs.
// From the c folder:  make run LESSON=10-structs

#include <stdio.h>
#include <stddef.h> // declares offsetof

struct point {
    int x;
    int y;
};

struct sample {
    char name[8];
    int id;
};

// A char then an int. The compiler adds unused bytes after tag so that
// value starts at an address the machine reads quickly.
struct padded {
    char tag;
    int value;
};

int main(void) {
    struct point p;
    p.x = 2;
    p.y = 5;
    printf("point is (%d, %d)\n", p.x, p.y);
    printf("sizeof(struct point) = %zu\n", sizeof(struct point));
    // offsetof gives how many bytes from the start of the struct a field is.
    printf("offset of y = %zu\n", offsetof(struct point, y));

    // Fields are given in order: name first, then id.
    struct sample s = {"Ada", 1111};
    printf("sample name starts with %c\n", s.name[0]);
    printf("sizeof(struct sample) = %zu\n", sizeof(struct sample));
    printf("offset of id = %zu\n", offsetof(struct sample, id));

    // 1 + 4 = 5 bytes of fields, but the struct is bigger.
    printf("sizeof(struct padded) = %zu\n", sizeof(struct padded));
    printf("offset of value = %zu\n", offsetof(struct padded, value));

    // Assigning a struct copies all of it. Changing the copy leaves p alone.
    struct point copy = p;
    copy.x = 9;
    printf("after editing the copy, p.x = %d\n", p.x);

    return 0;
}
