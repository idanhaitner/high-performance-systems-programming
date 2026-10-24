# 06 — Arrays and strings

Until now, one variable held one value. An **array** holds many values of the same type, one after another in memory. A **string**, a piece of text, is an array of characters. This lesson shows both, and why a C function that receives an array also needs its length.

## An array

```c
int scores[4] = {10, 20, 30, 40};
int last = scores[3];
```

- `int scores[4]` creates 4 `int`s in a row, all under the name `scores`.
- `{10, 20, 30, 40}` gives them their starting values.
- `scores[3]` reads one of them. The number in the brackets is the **index**: the position in the row.

Indexes start at **0**, not 1. So the four elements are `scores[0]`, `scores[1]`, `scores[2]`, and `scores[3]`. The last index is always one less than the length.

```text
index:    0    1    2    3
value:  [10] [20] [30] [40]
```

Using an index outside `0` to `3` is **undefined behavior**: C does not check, and the program may read or overwrite unrelated memory. That includes `scores[4]` and any negative index.

## Walking through an array

A `for` loop visits every element:

```c
int sum = 0;
for (int i = 0; i < 4; i = i + 1) {
    sum = sum + scores[i];
}
```

The condition is `i < 4`, not `i <= 4`, because the last index is 3.

## Passing an array to a function

```c
int sum_array(const int* a, int n) {
    int sum = 0;
    for (int i = 0; i < n; i = i + 1) {
        sum = sum + a[i];
    }
    return sum;
}
```

Call it as `sum_array(scores, 4)`.

When you pass an array to a function, C does not copy the elements. It passes only the **address** of the first element: where the array starts in memory. The parameter type `const int* a` means "the address of an `int`". Lesson 07 explains addresses fully. For now:

- Inside the function, you still write `a[i]` to read element `i`, as with a normal array.
- `const` means the function promises to only read the elements, never change them.
- The address alone does not say how many elements there are. That is why the caller must also pass the length `n`.

When `n` is 0, the loop body never runs and the function never reads `a`. The caller may then pass `0` as the address, meaning "no array at all". Lesson 07 calls this a null pointer.

## A string

```c
char name[] = "Ada";
```

Text in double quotes is a **string**. C stores it as an array of `char`, with one extra character at the end: `'\0'`, the character whose code is 0. That marker is called the **terminator**. It says "the text ends here".

```text
index:    0     1     2     3
value:  ['A'] ['d'] ['a'] ['\0']
```

So `name` uses 4 `char`s, but the text "Ada" has **length** 3. The length counts the characters before the terminator. The empty brackets in `name[]` let the compiler count the size for you.

`'\0'` is not the digit `'0'`. The digit character `'0'` has code 48. `'\0'` has code 0.

## Finding the length of a string

A string does not store its length. To find it, walk the characters until you reach the terminator:

```c
int length = 0;
while (name[length] != '\0') {
    length = length + 1;
}
```

`!=` means "not equal". The loop stops at the terminator, so `length` ends at 3.

This is why the terminator matters. A string function such as this one has no other way to know where the text ends. If the terminator were missing, the loop would keep reading memory past the end of the array, which is undefined behavior.

## What the demo prints

```text
sum of 4 scores = 100
last score = 40
length of Ada = 3
first letter = A
```

## Exercise

Open `exercise.c`. Each unfinished function contains a `not_implemented(...)` line. Replace it with your code. Then:

```bash
make try LESSON=06-arrays-and-strings
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [pointers](../07-pointers/lesson.md), which explains the addresses that arrays are passed as.
