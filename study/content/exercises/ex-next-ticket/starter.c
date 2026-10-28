/* Return 1 the first time it is called, 2 the second time, 3 the third, and so on. */
int next_ticket(void) {
    /* TODO: this local variable is created again, at 0, on every call.
       Make it keep its value from one call to the next. */
    int count = 0;
    count = count + 1;
    return count;
}
