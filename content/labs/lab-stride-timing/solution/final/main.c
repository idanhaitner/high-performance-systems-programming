/* main.c: the score report program.
   Usage: ./report NAME POINTS NAME POINTS ... */
#include <stdio.h>
#include "players.h"

int main(int argc, char *argv[]) {
    struct player list[MAX_PLAYERS];
    int n = read_players(argc, argv, list);
    if (n == -1) {
        printf("usage: %s NAME POINTS NAME POINTS ...\n", argv[0]);
        return 1;
    }
    print_report(list, n);
    return 0;
}
