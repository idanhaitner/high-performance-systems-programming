int main(void) {
    double A[4] = {1, 2, 3, 4}, B[4] = {5, 6, 7, 8}, C[4] = {0, 0, 0, 0};
    multiply(2, A, B, C);
    CHECK("two by two", C[0] == 19 && C[1] == 22 && C[2] == 43 && C[3] == 50,
          "the product should be {19, 22, 43, 50}, but it is {%g, %g, %g, %g}", C[0], C[1], C[2], C[3]);

    double M[9] = {2, 7, 1, 3, 4, 9, 5, 6, 8};
    double I[9] = {1, 0, 0, 0, 1, 0, 0, 0, 1};
    double R[9] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
    multiply(3, M, I, R);
    int same = 1;
    for (int i = 0; i < 9; i++)
        if (R[i] != M[i]) same = 0;
    CHECK("identity matrix", same, "a matrix times the identity matrix should give the same matrix back");

    double D[4] = {99, 99, 99, 99};
    multiply(2, A, B, D);
    CHECK("old numbers in C", D[0] == 19 && D[1] == 22 && D[2] == 43 && D[3] == 50,
          "C started with 99 in every position, and the product should still be {19, 22, 43, 50}, but it is {%g, %g, %g, %g}", D[0], D[1], D[2], D[3]);
    return 0;
}
