/* players.c: the code of the functions declared in players.h. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "players.h"

int read_players(int argc, char *argv[], struct player *list) {
    /* TODO:
       1. The words after the program's name are argc - 1. Return -1 if there
          are none, if their number is odd, or if they make more than
          MAX_PLAYERS players.
       2. For each pair, copy the name into list[k].name with strncpy, and make
          sure it ends with '\0' even when the name is too long to fit.
       3. Turn the points word into a number with atoi.
       4. Return the number of players. */
    (void)argc;
    (void)argv;
    (void)list;
    return 0;
}

long long total_points(const struct player *list, int n) {
    /* TODO: add up the points of all n players. Think about the type of your
       running total: two big scores together do not fit in an int. */
    (void)list;
    (void)n;
    return 0;
}

double average_points(const struct player *list, int n) {
    /* TODO: use total_points. Keep the fraction: 7 points for 2 players is 3.5. */
    (void)list;
    (void)n;
    return 0;
}

/* Returns a pointer to the player with the most points. n is at least 1.
   If two players tie, returns the first of them. */
const struct player *best_player(const struct player *list, int n) {
    const struct player *best = list;
    /* TODO: walk through the players with a pointer p, from list up to, but
       not including, list + n. Whenever p->points is larger than best->points,
       make best point to that player. */
    (void)n;
    return best;
}

void print_report(const struct player *list, int n) {
    /* TODO: print exactly this shape (the numbers are an example):
       Dana 90
       Noam 75
       Lior 82
       Total: 247
       Average: 82.33
       Best: Dana (90)
       A long long is printed with %lld. */
    (void)list;
    (void)n;
}
