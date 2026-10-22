// Lesson 12 — a growing stack.
// From this directory:  make run LESSON=12-capstone

#include <stdio.h>
#include <stdlib.h>

struct int_stack {
    int* data;
    int length;
    int capacity;
};

static void stack_init(struct int_stack* s) {
    s->data = 0;
    s->length = 0;
    s->capacity = 0;
}

static void stack_push(struct int_stack* s, int value) {
    if (s->length == s->capacity) {
        int next = s->capacity == 0 ? 4 : s->capacity * 2;
        int* grown = malloc((size_t)next * sizeof(int));
        if (grown == 0) {
            return;
        }
        for (int i = 0; i < s->length; i = i + 1) {
            grown[i] = s->data[i];
        }
        free(s->data);
        s->data = grown;
        s->capacity = next;
    }
    s->data[s->length] = value;
    s->length = s->length + 1;
}

static int stack_pop(struct int_stack* s) {
    s->length = s->length - 1;
    return s->data[s->length];
}

static void stack_free(struct int_stack* s) {
    free(s->data);
    s->data = 0;
    s->length = 0;
    s->capacity = 0;
}

int main(void) {
    struct int_stack s;
    stack_init(&s);
    stack_push(&s, 10);
    stack_push(&s, 20);
    stack_push(&s, 30);
    printf("size = %d\n", s.length);
    printf("capacity = %d\n", s.capacity);
    printf("pop = %d\n", stack_pop(&s));
    printf("pop = %d\n", stack_pop(&s));
    printf("pop = %d\n", stack_pop(&s));
    printf("size after pops = %d\n", s.length);
    stack_free(&s);
    return 0;
}
