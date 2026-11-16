/* The checks behind "make final". You do not need to change this file.
   Each check compares your function with a slow but simple version of it. */
#include <math.h>
#include <stdio.h>
#include "fast.h"

static int wrong = 0;

static void check(int ok, const char *what, const char *help) {
    if (ok) {
        printf("OK     %s\n", what);
    } else {
        printf("WRONG  %s: %s\n", what, help);
        wrong = 1;
    }
}

/* Two doubles are close when they differ by at most one part in a billion. */
static int close_to(double got, double want) {
    return fabs(got - want) <= 1e-9 * fabs(want) + 1e-12;
}

static double slow_dot(const double *a, const double *b, int n) {
    double sum = 0;
    for (int i = 0; i < n; i++)
        sum += a[i] * b[i];
    return sum;
}

static void slow_smooth(int rows, int cols, const float *img, float *out, float t) {
    for (int j = 1; j < cols - 1; j++)
        for (int i = 1; i < rows - 1; i++) {
            int p = i * cols + j;
            float avg = (img[p - cols] + img[p + cols] + img[p - 1] + img[p + 1]) * 0.25f;
            out[p] = (img[p] > t) ? avg : img[p];
        }
}

static double slow_update(const float *a, const float *b, float *out, int n, float limit) {
    double energy = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] > limit) {
            out[i] = a[i] * b[i] + 1.0f;
            energy += (double)out[i] * out[i];
        } else {
            out[i] = 0;
        }
    }
    return energy;
}

/* Small whole numbers in a fixed but mixed-up order. */
static float mixed(int i) {
    return (float)((i * 37 + 11) % 23) - 11;
}

int main(void) {
    double a[11], b[11];
    for (int i = 0; i < 11; i++) {
        a[i] = i + 1;
        b[i] = (i % 3) - 1;
    }
    check(close_to(dot4(a, b, 8), slow_dot(a, b, 8)), "dot4 with a multiple of four",
          "for 8 numbers, the result should match the sum of a[i] * b[i]");
    check(close_to(dot4(a, b, 11), slow_dot(a, b, 11)) && close_to(dot4(a, b, 3), slow_dot(a, b, 3)),
          "dot4 with numbers left over",
          "for 11 and for 3 numbers, the 0 to 3 numbers after the main loop must be added too");
    check(dot4(a, b, 0) == 0, "dot4 of nothing", "with n = 0, the result should be 0");

    enum { R = 6, C = 7 };
    float img[R * C], mine[R * C], want[R * C];
    for (int p = 0; p < R * C; p++) {
        img[p] = mixed(p);
        mine[p] = want[p] = -100;
    }
    smooth(R, C, img, mine, 0.0f);
    slow_smooth(R, C, img, want, 0.0f);
    int inside_ok = 1, border_ok = 1;
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            int p = i * C + j;
            int border = i == 0 || j == 0 || i == R - 1 || j == C - 1;
            if (border && mine[p] != -100)
                border_ok = 0;
            if (!border && fabsf(mine[p] - want[p]) > 1e-5f)
                inside_ok = 0;
        }
    check(inside_ok, "smooth sets every inner pixel",
          "an inner pixel above t becomes the average of its four neighbors, and any other inner pixel keeps its value");
    check(border_ok, "smooth leaves the border alone",
          "the first and last row and the first and last column of out must not change");

    enum { N = 13 };
    float x[N], y[N], out[N], ref[N];
    for (int i = 0; i < N; i++) {
        x[i] = mixed(i);
        y[i] = mixed(i + 5) / 4;
        out[i] = ref[i] = 77;
    }
    double e = update(x, y, out, N, 0.5f);
    double want_e = slow_update(x, y, ref, N, 0.5f);
    int out_ok = 1;
    for (int i = 0; i < N; i++)
        if (out[i] != ref[i])
            out_ok = 0;
    check(out_ok, "update writes every output",
          "out[i] should be a[i] * b[i] + 1 when a[i] is above the limit, and 0 otherwise");
    check(close_to(e, want_e), "update returns the energy",
          "the result should be the sum of out[i] * out[i], added up as doubles");

    if (wrong) {
        printf("\nSome checks are WRONG. Read the line above each one, and fix the function in final/fast.c.\n");
        return 1;
    }
    printf("\nOK: every final check passes.\n");
    return 0;
}
