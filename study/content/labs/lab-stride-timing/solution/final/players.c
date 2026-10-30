/* players.c: the code of the functions declared in players.h. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "players.h"

int read_players(int argc, char *argv[], struct player *list) {
    int words = argc - 1;
    if (words <= 0 || words % 2 != 0 || words / 2 > MAX_PLAYERS)
        return -1;

    int n = words / 2;
    for (int k = 0; k < n; k++) {
        const char *name = argv[1 + 2 * k];
        const char *points = argv[2 + 2 * k];
        strncpy(list[k].name, name, NAME_SIZE - 1);
        list[k].name[NAME_SIZE - 1] = '\0'; /* strncpy may leave it out */
        list[k].points = atoi(points);
    }
    return n;
}

long long total_points(const struct player *list, int n) {
    long long total = 0;
    for (int k = 0; k < n; k++)
        total = total + list[k].points;
    return total;
}

double average_points(const struct player *list, int n) {
    double total = total_points(list, n); /* a double, so the division keeps the fraction */
    return total / n;
}

/* Returns a pointer to the player with the most points. n is at least 1.
   If two players tie, returns the first of them. */
const struct player *best_player(const struct player *list, int n) {
    const struct player *best = list;
    for (const struct player *p = list; p < list + n; p++) {
        if (p->points > best->points) /* > keeps the first of two equal scores */
            best = p;
    }
    return best;
}

void print_report(const struct player *list, int n) {
    for (int k = 0; k < n; k++)
        printf("%s %d\n", list[k].name, list[k].points);
    printf("Total: %lld\n", total_points(list, n));
    printf("Average: %.2f\n", average_points(list, n));
    const struct player *best = best_player(list, n);
    printf("Best: %s (%d)\n", best->name, best->points);
}
