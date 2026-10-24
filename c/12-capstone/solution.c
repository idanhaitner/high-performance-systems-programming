// Finished lesson 12. Write yours in exercise.c first.

#include "check.h"

#include <stdlib.h>

struct int_stack {
    int* data;
    int length;
    int capacity;
};

// An empty stack has no block yet. The first push allocates one.
void stack_init(struct int_stack* s) {
    s->data = 0;
    s->length = 0;
    s->capacity = 0;
}

void stack_push(struct int_stack* s, int value) {
    if (s->length == s->capacity) {
        // The block is full (or missing): allocate a bigger one.
        int next = s->capacity == 0 ? 4 : s->capacity * 2;
        int* grown = malloc((size_t)next * sizeof(int));
        if (grown == 0) {
            return; // out of memory: leave the stack unchanged
        }
        // Copy only the length values in use, then free the old block.
        // free(0) is safe, so the first growth needs no special case.
        for (int i = 0; i < s->length; i = i + 1) {
            grown[i] = s->data[i];
        }
        free(s->data);
        s->data = grown;
        s->capacity = next;
    }
    // The first free slot is at index length.
    s->data[s->length] = value;
    s->length = s->length + 1;
}

// After length shrinks by one, the old top is at index length. The block
// is kept, so a later push reuses the slot.
int stack_pop(struct int_stack* s) {
    s->length = s->length - 1;
    return s->data[s->length];
}

// Read the top without changing length.
int stack_top(const struct int_stack* s) {
    return s->data[s->length - 1];
}

int stack_size(const struct int_stack* s) {
    return s->length;
}

// Release the block and reset the fields, so the stack is empty again.
void stack_free(struct int_stack* s) {
    free(s->data);
    s->data = 0;
    s->length = 0;
    s->capacity = 0;
}

static void test_fresh(void) {
    struct int_stack s;
    stack_init(&s);
    expect_int(stack_size(&s), 0);
    stack_free(&s);
}

static void test_one(void) {
    struct int_stack s;
    stack_init(&s);
    stack_push(&s, 7);
    expect_int(stack_size(&s), 1);
    expect_int(stack_top(&s), 7);
    expect_int(s.capacity, 4);
    stack_free(&s);
}

static void test_order(void) {
    struct int_stack s;
    stack_init(&s);
    stack_push(&s, 1);
    stack_push(&s, 2);
    stack_push(&s, 3);
    expect_int(stack_pop(&s), 3);
    expect_int(stack_pop(&s), 2);
    expect_int(stack_pop(&s), 1);
    expect_int(stack_size(&s), 0);
    stack_free(&s);
}

static void test_growth(void) {
    struct int_stack s;
    stack_init(&s);
    for (int i = 0; i < 5; i = i + 1) {
        stack_push(&s, i);
    }
    expect_int(stack_size(&s), 5);
    expect_int(s.capacity, 8);
    expect_int(stack_top(&s), 4);
    stack_free(&s);
}

static void test_many(void) {
    struct int_stack s;
    stack_init(&s);
    for (int i = 0; i < 20; i = i + 1) {
        stack_push(&s, i * 10);
    }
    expect_int(stack_size(&s), 20);
    for (int i = 19; i >= 0; i = i - 1) {
        expect_int(stack_pop(&s), i * 10);
    }
    stack_free(&s);
}

static void test_top_keeps(void) {
    struct int_stack s;
    stack_init(&s);
    stack_push(&s, 4);
    expect_int(stack_top(&s), 4);
    expect_int(stack_size(&s), 1);
    stack_free(&s);
}

static void test_reuse(void) {
    struct int_stack s;
    stack_init(&s);
    stack_push(&s, 1);
    stack_pop(&s);
    stack_push(&s, 9);
    expect_int(stack_top(&s), 9);
    expect_int(stack_size(&s), 1);
    stack_free(&s);
}

int main(void) {
    Score score = {0};
    task(&score, "a fresh stack has size 0", test_fresh);
    task(&score, "the first push stores 7 at capacity 4", test_one);
    task(&score, "pop returns 3, then 2, then 1", test_order);
    task(&score, "the fifth push grows capacity to 8", test_growth);
    task(&score, "20 pushes pop in reverse", test_many);
    task(&score, "top does not remove the value", test_top_keeps);
    task(&score, "a push after pop reuses the slot", test_reuse);
    return score_finish(&score);
}
