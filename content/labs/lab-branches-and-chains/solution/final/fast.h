#ifndef FAST_H
#define FAST_H

double dot4(const double *restrict a, const double *restrict b, int n);
void smooth(int rows, int cols, const float *restrict img, float *restrict out, float t);
double update(const float *restrict a, const float *restrict b, float *restrict out, int n, float limit);

#endif
