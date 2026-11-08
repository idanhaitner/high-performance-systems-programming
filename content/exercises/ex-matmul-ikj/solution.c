void multiply(int n, const double *A, const double *B, double *C) {
    for (int i = 0; i < n * n; i++)
        C[i] = 0;
    for (int i = 0; i < n; i++) {
        for (int k = 0; k < n; k++) {
            double aik = A[i * n + k];
            for (int j = 0; j < n; j++)
                C[i * n + j] += aik * B[k * n + j];
        }
    }
}
