#include "fast.h"

double dot4(const double *restrict a, const double *restrict b, int n) {
    double s0 = 0, s1 = 0, s2 = 0, s3 = 0;
    int i = 0;
    for (; i + 3 < n; i += 4) {
        s0 += a[i] * b[i];
        s1 += a[i + 1] * b[i + 1];
        s2 += a[i + 2] * b[i + 2];
        s3 += a[i + 3] * b[i + 3];
    }
    double sum = (s0 + s1) + (s2 + s3);
    for (; i < n; i++)
        sum += a[i] * b[i];
    return sum;
}

void smooth(int rows, int cols, const float *restrict img, float *restrict out, float t) {
    for (int i = 1; i < rows - 1; i++) {
        for (int j = 1; j < cols - 1; j++) {
            int p = i * cols + j;
            float avg = (img[p - cols] + img[p + cols] + img[p - 1] + img[p + 1]) * 0.25f;
            out[p] = (img[p] > t) ? avg : img[p];
        }
    }
}

double update(const float *restrict a, const float *restrict b, float *restrict out, int n, float limit) {
    double e0 = 0, e1 = 0;
    int i = 0;
    for (; i + 1 < n; i += 2) {
        float v0 = a[i] > limit ? a[i] * b[i] + 1.0f : 0.0f;
        float v1 = a[i + 1] > limit ? a[i + 1] * b[i + 1] + 1.0f : 0.0f;
        out[i] = v0;
        out[i + 1] = v1;
        e0 += (double)v0 * v0;
        e1 += (double)v1 * v1;
    }
    double energy = e0 + e1;
    for (; i < n; i++) {
        float v = a[i] > limit ? a[i] * b[i] + 1.0f : 0.0f;
        out[i] = v;
        energy += (double)v * v;
    }
    return energy;
}
