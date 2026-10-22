# 07 — Pointers

A pointer is a variable that stores the address of an object. With the address, a function can read or write the caller's own object. Passing an `int` only copied the value.

## Address and dereference

```c
int year = 2026;
int* p = &year;
*p = 2027;
```

`&year` is the address of `year`. `int* p` is a pointer to an `int`. `*p` is the object at that address. The first `*` in `int*` is part of the type. The `*` in `*p` reads or writes the object.

| Token | Meaning |
| --- | --- |
| `int* p` | `p` holds the address of an `int` |
| `&year` | the address of `year` |
| `*p` | the `int` stored at that address |
| `p = &year` | store an address into the pointer |

After `*p = 2027`, `year` is 2027. The write went through the address. This is how C changes a caller's variable. The functions lesson could not do it, because a parameter was a copy.

`a[i]` is the element `i` positions past `a`. `*(a + i)` is the same element. An array name used as a pointer is the address of element 0.

## Null and const

A pointer that holds no address is a null pointer, written `0` or `NULL`. Dereferencing it is **undefined behavior**. Test before you use it.

```c
int read_or(const int* p, int fallback) {
    if (p == 0) {
        return fallback;
    }
    return *p;
}
```

`const int*` means you may read the `int` and you may not write it through this pointer. The object can still change through a different, non-const pointer. `const` is a promise of this view, and the compiler enforces it on this view.

```c
/* Do not run this. *missing is undefined behavior. */
int* missing = 0;
*missing = 1;
```

## What the demo prints

```text
year = 2026
the pointer refers to 2026
after the write, year = 2027
a null pointer was not dereferenced
const view reads 2027
```

## Exercise

Open `exercise.c`. Each function still calls `not_implemented`. Then:

```bash
make try LESSON=07-pointers
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [memory](../08-memory/lesson.md).
