// Lesson 1 — a program.
// From the c folder:  make run LESSON=01-program

#include <stdio.h> // declares printf

// The program starts here.
int main(void) {
    printf("A C program starts in main.\n");

    // Create an int variable named year and put 2026 in it.
    int year = 2026;
    // %d is replaced by the value of year.
    printf("year = %d\n", year);

    // Read year, add 1, and store the result back into year.
    year = year + 1;
    printf("after adding 1, year = %d\n", year);

    // 0 tells the operating system that the program succeeded.
    return 0;
}
