int main(void) {
    CHECK("smaller size", sizeof(struct Record) == 16, "sizeof(struct Record) is %zu, but it should be 16. Put the biggest member first.", sizeof(struct Record));

    struct Record r = {.active = 1, .value = 2.5, .id = 7, .type = 'x'};
    CHECK("members kept", r.active == 1 && r.value == 2.5 && r.id == 7 && r.type == 'x', "the structure should still have the members active, value, id, and type");
    return 0;
}
