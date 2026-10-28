/* Return 1 the first time it is called, 2 the second time, 3 the third, and so on. */
int next_ticket(void) {
    static int count = 0; /* lives in .bss for the whole run; set to 0 only once */
    count = count + 1;
    return count;
}
