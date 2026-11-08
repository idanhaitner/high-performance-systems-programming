/* players.h: what players.c offers to the other files. */
#ifndef PLAYERS_H
#define PLAYERS_H

#define MAX_PLAYERS 10
#define NAME_SIZE 16 /* room for 15 letters and the '\0' */

struct player {
    char name[NAME_SIZE];
    int points;
};

/* Reads pairs of words, a name and then its points, from argv[1] onward,
   into list. Returns how many players it read, or -1 if there are no words,
   an odd number of words, or more than MAX_PLAYERS players. */
int read_players(int argc, char *argv[], struct player *list);

/* Returns the sum of all the points. */
long long total_points(const struct player *list, int n);

/* Returns the average of the points, with its fraction. n is at least 1. */
double average_points(const struct player *list, int n);

/* Returns a pointer to the player with the most points. n is at least 1.
   If two players tie, returns the first of them. */
const struct player *best_player(const struct player *list, int n);

/* Prints the report: one line per player, then the total, average, and best. */
void print_report(const struct player *list, int n);

#endif
