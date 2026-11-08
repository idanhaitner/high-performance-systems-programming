int main(void) {
    int A[4] = {10, 20, 30, 40};
    int *p = last_element(A, 4);
    CHECK("four elements", p == &A[3], "for 4 elements the answer should be &A[3], but you are %d elements away from it", (int)(p - &A[3]));

    int B[1] = {7};
    p = last_element(B, 1);
    CHECK("one element", p == &B[0], "with 1 element, the last one is also the first, but you are %d elements away from it", (int)(p - &B[0]));

    int C[3] = {1, 2, 3};
    p = last_element(C, 3);
    if (p == &C[2]) *p = 9;
    CHECK("writes reach the array", C[2] == 9, "writing through the pointer should change C[2], but C[2] is %d", C[2]);
    return 0;
}
