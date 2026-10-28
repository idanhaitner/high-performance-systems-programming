struct student {
    char name[32];
    int id;
    int grade;
};

/* Return the index (position, counting from 0) of the student with the
   highest grade among the n students in s. n is at least 1.
   If several students share the highest grade, return the first of them. */
int best_index(const struct student *s, int n) {
    /* TODO: look at every student, s[0] up to s[n - 1], and remember
       the index of the highest grade seen so far. */
    return 0;
}
