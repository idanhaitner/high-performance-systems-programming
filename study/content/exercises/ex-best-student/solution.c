struct student {
    char name[32];
    int id;
    int grade;
};

/* Return the index (position, counting from 0) of the student with the
   highest grade among the n students in s. n is at least 1.
   If several students share the highest grade, return the first of them. */
int best_index(const struct student *s, int n) {
    int best = 0; /* index of the best student seen so far */
    for (int i = 1; i < n; i++) {
        if (s[i].grade > s[best].grade) { /* strictly higher: a tie keeps the first */
            best = i;
        }
    }
    return best;
}
