#pragma once

/* Tiny checker for the exercises. You do not need to modify this file.
   A task that still calls not_implemented(...) prints [todo].
   A task that runs and fails a check prints [fail].

   C has no exceptions. not_implemented and the expect_* functions jump
   back to task() with longjmp. Do not call task() from inside a task. */

#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(__GNUC__) || defined(__clang__)
#define CHECK_NORETURN __attribute__((noreturn))
#else
#define CHECK_NORETURN
#endif

typedef struct Score {
    int passed;
    int failed;
    int todo;
} Score;

typedef void (*TaskFn)(void);

static jmp_buf check_env;
static volatile int check_kind; /* 1 = todo, 2 = fail */
static volatile int check_armed;
static char check_why[240];

CHECK_NORETURN static inline void fail_check(const char* why) {
    if (!check_armed) {
        fprintf(stderr, "%s\n", why);
        exit(1);
    }
    check_kind = 2;
    snprintf(check_why, sizeof check_why, "%s", why);
    check_armed = 0;
    longjmp(check_env, 1);
}

CHECK_NORETURN static inline void not_implemented(const char* exercise) {
    if (!check_armed) {
        fprintf(stderr, "not implemented: %s\n", exercise);
        exit(1);
    }
    check_kind = 1;
    snprintf(check_why, sizeof check_why, "%s", exercise);
    check_armed = 0;
    longjmp(check_env, 1);
}

static inline void expect_int(int got, int want) {
    if (got != want) {
        char buf[240];
        snprintf(buf, sizeof buf, "expected %d, got %d", want, got);
        fail_check(buf);
    }
}

static inline void expect_true(int cond, const char* why) {
    if (!cond) {
        fail_check(why);
    }
}

static inline void expect_str(const char* got, const char* want) {
    if (got == NULL || want == NULL || strcmp(got, want) != 0) {
        char buf[240];
        snprintf(buf, sizeof buf, "expected \"%s\", got \"%s\"",
                 want != NULL ? want : "(null)",
                 got != NULL ? got : "(null)");
        fail_check(buf);
    }
}

static inline void expect_ptr(const void* got, const void* want) {
    if (got != want) {
        fail_check("pointers differ");
    }
}

static inline void score_pass(Score* score, const char* name) {
    printf("  [pass] %s\n", name);
    score->passed++;
}

static inline void score_fail(Score* score, const char* name, const char* why) {
    printf("  [fail] %s\n         %s\n", name, why);
    score->failed++;
}

static inline void score_skip(Score* score, const char* name) {
    printf("  [todo] %s\n", name);
    score->todo++;
}

static inline void task(Score* score, const char* name, TaskFn fn) {
    check_kind = 0;
    check_armed = 1;
    if (setjmp(check_env) == 0) {
        fn();
        check_armed = 0;
        score_pass(score, name);
    } else if (check_kind == 1) {
        check_armed = 0;
        score_skip(score, name);
    } else {
        check_armed = 0;
        score_fail(score, name, check_why);
    }
}

static inline int score_finish(const Score* score) {
    printf("\n%d passed, %d failed, %d still to do.\n",
           score->passed, score->failed, score->todo);
    if (score->failed == 0 && score->todo == 0) {
        printf("All exercises complete.\n");
    } else if (score->failed == 0) {
        printf("Fill in each [todo], then run again.\n");
    }
    return score->failed == 0 ? 0 : 1;
}
