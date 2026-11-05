/* The checks behind "make final". You do not need to change this file. */
#include <stdio.h>
#include <stddef.h>
#include "blocks.h"

static int wrong = 0;

static void check(int ok, const char *what, const char *help) {
    if (ok) {
        printf("OK     %s\n", what);
    } else {
        printf("WRONG  %s: %s\n", what, help);
        wrong = 1;
    }
}

struct one { char c; int x; short s; };
struct two { int x; char c; char d; };
struct three { char active; double value; int id; char type; };
struct four { double value; int id; char active; char type; };

int main(void) {
    check(round_up(5, 4) == 8 && round_up(8, 4) == 8 && round_up(0, 8) == 0 && round_up(13, 8) == 16,
          "round_up moves an offset to the next boundary",
          "5 up to a multiple of 4 is 8, 8 stays 8, 0 stays 0, and 13 up to a multiple of 8 is 16");

    size_t a[] = {1, 4, 2};
    size_t b[] = {4, 1, 1};
    size_t c[] = {1, 8, 4, 1};
    size_t d[] = {8, 4, 1, 1};
    check(struct_size(a, 3) == sizeof(struct one) && struct_size(b, 3) == sizeof(struct two),
          "struct_size matches the compiler for two small structures",
          "{char, int, short} should be 12 and {int, char, char} should be 8");
    check(struct_size(c, 4) == sizeof(struct three) && struct_size(d, 4) == sizeof(struct four),
          "struct_size sees that the order of the members matters",
          "{char, double, int, char} should be 24 and {double, int, char, char} should be 16");

    check(lines_touched(60, 4) == 1 && lines_touched(62, 4) == 2 && lines_touched(0, 64) == 1
              && lines_touched(32, 128) == 3,
          "lines_touched counts the cache lines of a range",
          "4 bytes at 60 are in 1 line, 4 bytes at 62 are in 2 lines, 64 bytes at 0 are in 1 line, and 128 bytes at 32 are in 3");

    double in4[16], out4[17];
    for (int i = 0; i < 16; i++) {
        in4[i] = i;
        out4[i] = -1;
    }
    out4[16] = -7;
    transpose_blocked(4, 2, in4, out4);
    int ok = 1;
    for (int i = 0; i < 4; i++)
        for (int j = 0; j < 4; j++)
            if (out4[j * 4 + i] != in4[i * 4 + j])
                ok = 0;
    check(ok, "transpose_blocked turns rows into columns",
          "out[j * n + i] should hold in[i * n + j] for every i and j, with n = 4 and bs = 2");

    double in5[25], out5[26];
    for (int i = 0; i < 25; i++) {
        in5[i] = i * 3 + 1;
        out5[i] = -1;
    }
    out5[25] = -7;
    transpose_blocked(5, 2, in5, out5);
    ok = 1;
    for (int i = 0; i < 5; i++)
        for (int j = 0; j < 5; j++)
            if (out5[j * 5 + i] != in5[i * 5 + j])
                ok = 0;
    check(ok, "transpose_blocked works when n is not a multiple of bs",
          "with n = 5 and bs = 2, the last tiles are smaller. Stop each tile at n.");

    double in3[9], out3[10];
    for (int i = 0; i < 9; i++) {
        in3[i] = i + 10;
        out3[i] = -1;
    }
    out3[9] = -7;
    transpose_blocked(3, 8, in3, out3);
    ok = out3[9] == -7;
    for (int i = 0; i < 3; i++)
        for (int j = 0; j < 3; j++)
            if (out3[j * 3 + i] != in3[i * 3 + j])
                ok = 0;
    check(ok, "transpose_blocked stays inside the arrays",
          "with n = 3 and bs = 8, one tile covers everything. Nothing may be written after the 9 numbers.");

    if (wrong) {
        printf("\nSome checks are WRONG. Read the line above each one, and fix the function in final/blocks.c.\n");
        return 1;
    }
    printf("\nOK: every final check passes.\n");
    return 0;
}
