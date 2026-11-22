#ifndef PAR_H
#define PAR_H

#define PAR_MAX_WORKERS 8

long long par_dot(const int *a, const int *b, int n, int workers);
int par_max(const int *a, int n, int workers);
long par_count_above(const int *a, int n, int workers, int chunk, int limit);

#endif
