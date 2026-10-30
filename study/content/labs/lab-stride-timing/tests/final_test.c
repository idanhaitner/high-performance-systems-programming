/* The checks behind "make final". You do not need to change this file. */
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <string.h>
#include <sys/wait.h>
#include "players.h"

static int wrong = 0;

static void check(int ok, const char *what, const char *help) {
    if (ok) {
        printf("OK     %s\n", what);
    } else {
        printf("WRONG  %s: %s\n", what, help);
        wrong = 1;
    }
}

/* Runs a command, keeps what it prints in out, and returns its exit code. */
static int run(const char *command, char *out, size_t size) {
    out[0] = '\0';
    FILE *pipe = popen(command, "r");
    if (pipe == NULL)
        return -1;
    size_t got = fread(out, 1, size - 1, pipe);
    out[got] = '\0';
    int status = pclose(pipe);
    return WIFEXITED(status) ? WEXITSTATUS(status) : -1;
}

int main(void) {
    struct player list[MAX_PLAYERS];

    char *three[] = {"report", "Dana", "90", "Noam", "75", "Lior", "82", NULL};
    int n = read_players(7, three, list);
    check(n == 3 && strcmp(list[0].name, "Dana") == 0 && list[0].points == 90
              && strcmp(list[2].name, "Lior") == 0 && list[2].points == 82,
          "read_players reads names and points",
          "for Dana 90 Noam 75 Lior 82 it should return 3 and fill list[0] to list[2]");

    char *only_program[] = {"report", NULL};
    char *odd[] = {"report", "Dana", "90", "Noam", NULL};
    check(read_players(1, only_program, list) == -1 && read_players(4, odd, list) == -1,
          "read_players refuses bad input",
          "with no words, or an odd number of words, it should return -1");

    char *too_many[] = {"report", "a", "1", "b", "1", "c", "1", "d", "1", "e", "1", "f", "1",
                        "g", "1", "h", "1", "i", "1", "j", "1", "k", "1", NULL};
    check(read_players(23, too_many, list) == -1, "read_players refuses too many players",
          "11 players do not fit in list, so it should return -1 and not write past the end");

    char *long_name[] = {"report", "Bartholomew-Alexander", "1", NULL};
    n = read_players(3, long_name, list);
    check(n == 1 && strcmp(list[0].name, "Bartholomew-Ale") == 0, "read_players cuts a long name",
          "the name should keep its first 15 letters and end with '\\0'");

    struct player some[3] = {{"Dana", 90}, {"Noam", 75}, {"Lior", 82}};
    check(total_points(some, 3) == 247, "total_points adds up", "90 + 75 + 82 should be 247");

    struct player big[2] = {{"Dana", 2000000000}, {"Noam", 2000000000}};
    check(total_points(big, 2) == 4000000000LL, "total_points handles big scores",
          "the total should be 4000000000, which does not fit in an int, so use a long long");

    struct player two[2] = {{"Dana", 3}, {"Noam", 4}};
    double average = average_points(two, 2);
    check(average > 3.49 && average < 3.51, "average_points keeps the fraction", "3 and 4 should average 3.5");

    check(best_player(some, 3) == &some[0], "best_player finds the first place",
          "for 90, 75, 82 it should point to the first player");
    struct player later[3] = {{"Dana", 1}, {"Noam", 9}, {"Lior", 9}};
    check(best_player(later, 3) == &later[1], "best_player keeps the first of a tie",
          "for 1, 9, 9 it should point to the second player, inside the array");

    char out[1000];
    int code = run("./report Dana 90 Noam 75 Lior 82", out, sizeof(out));
    check(code == 0 && strcmp(out, "Dana 90\nNoam 75\nLior 82\nTotal: 247\nAverage: 82.33\nBest: Dana (90)\n") == 0,
          "./report prints the report",
          "the words, spaces, and 2 digits after the point must match the shape in the lab");
    if (wrong && code == 0)
        printf("       your program printed:\n%s\n", out);

    code = run("./report Dana 90 Noam", out, sizeof(out));
    check(code == 1, "./report stops on bad input", "with an odd number of words, main should return 1");

    if (wrong) {
        printf("Not there yet: fix the first WRONG line, then run make final again.\n");
        return 1;
    }
    printf("OK: every final check passes.\n");
    return 0;
}
