struct student {
    char name[32];
    int id;
    int grade;
};

int best_index(const struct student *s, int n) {
    int best = 0; /* index of the best student seen so far */
    for (int i = 1; i < n; i++) {
        if (s[i].grade > s[best].grade) { /* strictly higher: a tie keeps the first */
            best = i;
        }
    }
    return best;
}
