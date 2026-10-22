// Lesson 12 exercises.
// Replace each not_implemented(...) call with your code.
// From this directory:  make try LESSON=12-capstone
// A finished version is in solution.c. Try before you open it.

#include "check.h"

#include <stdlib.h>

struct int_stack {
    int* data;
    int length;
    int capacity;
};

void stack_init(struct int_stack* s) {
    // Make an empty stack with no buffer. s is not null.
    not_implemented("stack_init");
}

void stack_push(struct int_stack* s, int value) {
    // Append value.
    // When length would pass capacity, allocate a larger buffer, copy the
    // old ints, and free the old buffer. Double a positive capacity.
    // The first allocation uses capacity 4.
    not_implemented("stack_push");
}

int stack_pop(struct int_stack* s) {
    // Remove and return the last value. The stack is not empty.
    not_implemented("stack_pop");
}

int stack_top(const struct int_stack* s) {
    // Return the last value without removing it. The stack is not empty.
    not_implemented("stack_top");
}

int stack_size(const struct int_stack* s) {
    // Return how many values the stack holds.
    not_implemented("stack_size");
}

void stack_free(struct int_stack* s) {
    // Release the buffer and leave the stack empty. s is not null.
    not_implemented("stack_free");
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
