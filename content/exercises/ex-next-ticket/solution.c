int next_ticket(void) {
    static int count = 0; /* lives in .bss for the whole run; set to 0 only once */
    count = count + 1;
    return count;
}
