# 06 — Arrays and strings

An array is a row of values of one type, stored in order. A string is an array of `char` that ends with the character `'\0'`.

## An array and its length

```c
int scores[4] = {10, 20, 30, 40};
int last = scores[3];
```

`scores[4]` creates four `int`s. The first index is 0. The last index is 3. The name `scores` in an expression is the address of the first element. A function that receives the array also needs the length, because the address alone does not say how many elements there are.

```c
int sum_array(const int* a, int n) {
    int sum = 0;
    for (int i = 0; i < n; i = i + 1) {
        sum = sum + a[i];
    }
    return sum;
}
```

`const int*` means the function reads the elements and does not write them. When `n` is 0, the loop body does not run. Do not read `a[0]` in that case. There is no element.

Reading or writing `a[n]`, or any index past the last element, is **undefined behavior**. So is a negative index. The length you pass is part of the contract.

## A string

```c
char name[] = "Ada";
```

This array holds `'A'`, `'d'`, `'a'`, and `'\0'`. The quotes `"Ada"` include the terminator. The length you care about is the count of characters before `'\0'`, which is 3, not 4.

```c
int length = 0;
while (name[length] != '\0') {
    length = length + 1;
}
```

`'\0'` is the character whose code is 0. It is not the digit character `'0'`. A string function stops at the terminator. It does not take a separate length. Walking forever because the terminator is missing is **undefined behavior**.

## What the demo prints

```text
sum of 4 scores = 100
last score = 40
length of Ada = 3
first letter = A
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=06-arrays-and-strings
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [pointers](../07-pointers/lesson.md).
