#include <stdlib.h>

typedef struct {
    int id;
    int grade;
} Student;

Student *make_roster(int n) {
    if (n <= 0)
        return NULL;
    Student *roster = calloc(n, sizeof(*roster));
    if (roster == NULL)
        return NULL;
    for (int i = 0; i < n; i++)
        roster[i].id = i + 1;
    return roster;
}
