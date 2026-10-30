int total_calls = 0; /* a global: it lives for the whole run */

/* Add 1 to the global total_calls. */
void count_call(void) {
    total_calls = total_calls + 1;
}
