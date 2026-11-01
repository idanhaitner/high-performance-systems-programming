int main(void) {
    Student *r = make_roster(3);
    CHECK("ids count from 1", r != NULL && r[0].id == 1 && r[1].id == 2 && r[2].id == 3, "make_roster(3) should give the students ids 1, 2, and 3");
    CHECK("grades start at 0", r != NULL && r[0].grade == 0 && r[1].grade == 0 && r[2].grade == 0, "every grade should start at 0");
    free(r);

    CHECK("no students", make_roster(0) == NULL && make_roster(-2) == NULL, "make_roster(0) and make_roster(-2) should return NULL");
    return 0;
}
