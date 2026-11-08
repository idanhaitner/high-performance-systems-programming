#ifndef PLAYERS_H
#define PLAYERS_H

#define MAX_PLAYERS 10
#define NAME_SIZE 16

struct player {
    char name[NAME_SIZE];
    int points;
};

int read_players(int argc, char *argv[], struct player *list);
long long total_points(const struct player *list, int n);
double average_points(const struct player *list, int n);
void print_report(const struct player *list, int n);

#endif
