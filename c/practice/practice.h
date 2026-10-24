#pragma once

/* Extra checks for the practice set. You do not need to modify this file.
   It adds three things to check.h:
     expect_double   compare two doubles, allowing a tiny rounding error
     expect_char     compare two characters
     capture_begin / expect_printed
                     catch what a function prints with printf, and compare
                     it with the text it should have printed */

/* dup, dup2, and fileno are POSIX functions, not plain C11. This line asks
   the system headers to declare them. It must come before any #include. */
#define _POSIX_C_SOURCE 200809L

#include "../include/check.h"

#include <math.h>
#include <stdbool.h>
#include <unistd.h>

static inline void expect_double(double got, double want) {
    if (fabs(got - want) > 1e-6) {
        char buf[240];
        snprintf(buf, sizeof buf, "expected %.6f, got %.6f", want, got);
        fail_check(buf);
    }
}

static inline void expect_char(char got, char want) {
    if (got != want) {
        char buf[240];
        snprintf(buf, sizeof buf, "expected '%c', got '%c'", want, got);
        fail_check(buf);
    }
}

/* How capturing works: while a capture is on, standard output (where printf
   writes) is pointed at a temporary file instead of the terminal.
   expect_printed points it back at the terminal and reads the file. */

static FILE* practice_capture;
static int practice_saved_stdout = -1;

static inline void capture_begin(void) {
    fflush(stdout);
    practice_capture = tmpfile();
    if (practice_capture == NULL) {
        fprintf(stderr, "could not open a temporary file\n");
        exit(1);
    }
    practice_saved_stdout = dup(fileno(stdout));
    dup2(fileno(practice_capture), fileno(stdout));
}

/* Describe one line of output for an error message. */
static inline void practice_describe(char* out, size_t size, const char* line) {
    if (*line == '\0') {
        snprintf(out, size, "nothing more");
        return;
    }
    const char* end = strchr(line, '\n');
    int len = end != NULL ? (int)(end - line) : (int)strlen(line);
    snprintf(out, size, "\"%.*s\"%s", len > 60 ? 60 : len, line,
             end != NULL ? "" : " with no \\n after it");
}

static inline void expect_printed(const char* want, const char* exercise) {
    char got[2048];
    size_t n;

    fflush(stdout);
    dup2(practice_saved_stdout, fileno(stdout));
    close(practice_saved_stdout);
    practice_saved_stdout = -1;
    rewind(practice_capture);
    n = fread(got, 1, sizeof got - 1, practice_capture);
    got[n] = '\0';
    fclose(practice_capture);
    practice_capture = NULL;

    // A function that printed nothing has not been written yet.
    if (n == 0) {
        not_implemented(exercise);
    }
    if (strcmp(got, want) == 0) {
        return;
    }

    // Find the first line that differs, and show only that line.
    const char* g = got;
    const char* w = want;
    int line = 1;
    for (;;) {
        const char* g_end = strchr(g, '\n');
        const char* w_end = strchr(w, '\n');
        size_t g_len = g_end != NULL ? (size_t)(g_end - g) : strlen(g);
        size_t w_len = w_end != NULL ? (size_t)(w_end - w) : strlen(w);
        if (g_len != w_len || memcmp(g, w, g_len) != 0 ||
            (g_end == NULL) != (w_end == NULL) || g_end == NULL) {
            break;
        }
        g = g_end + 1;
        w = w_end + 1;
        line++;
    }
    char want_text[100];
    char got_text[100];
    char buf[240];
    practice_describe(want_text, sizeof want_text, w);
    practice_describe(got_text, sizeof got_text, g);
    snprintf(buf, sizeof buf, "line %d: expected %s, got %s",
             line, want_text, got_text);
    fail_check(buf);
}
