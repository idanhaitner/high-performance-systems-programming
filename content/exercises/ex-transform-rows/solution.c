void transform(int rows, int cols, const float *restrict src, float *restrict dst) {
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            int p = i * cols + j;
            dst[p] = 3.0f * src[p] + 2.0f;
        }
    }
}
