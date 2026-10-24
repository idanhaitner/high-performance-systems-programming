---
id: structures
title: Structures
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/10-structs/lesson.md
---

An array holds elements of one type. A structure is a single object made of named members, which may have different types. The members are stored in declaration order, at increasing addresses. Between members the compiler may insert padding so that each member starts at an address suited to its type (its alignment), and it may add padding at the end so that arrays of the structure stay aligned. `sizeof` gives the size of the whole object, padding included, so it can be larger than the sum of the member sizes.

## Layout

:::definition id=def-struct title="Structure" source="Lecture 1 - Introduction.pdf"
A structure type declares named members. An object of that type stores the members in declaration order. Their exact byte offsets depend on the platform and can be measured with `offsetof` from `<stddef.h>`.
:::

```c
struct Student {
    char name[8];
    int id;
};

int main(void) {
    struct Student s;
    return 0;
}
```

`name` is an array of 8 `char`. On this platform an `int` is 4 bytes and must start at an address that is a multiple of 4. Offset 8 is already a multiple of 4, so `id` starts right after `name`. If `s` begins at address 1000, `name[0]` is at 1000 and `id` is at 1008. `sizeof(struct Student)` is therefore 12: 8 bytes of `name` and 4 bytes of `id`, with no padding.

When a member would start at a misaligned offset, padding appears:

```c
struct tagged {
    char tag;
    int value;
};
```

`tag` occupies offset 0, but `value` cannot start at offset 1, so the compiler inserts 3 padding bytes and places `value` at offset 4. The size is 8, not 5. The padding bytes belong to no member.

```c
#include <stdio.h>

struct st {
    int x;
    int y;
};

int main(void) {
    printf("%zu\n", sizeof(struct st));
    return 0;
}
```

Each `int` is 4 bytes with 4-byte alignment, so this structure needs no padding and the program prints 8.

:::trap
Adding up member sizes and using the sum as the structure's size. Padding can make `sizeof` larger, as with `struct tagged` (5 bytes of members, size 8). For `struct st` the two happen to agree.
:::

## Initialization

```c
struct Student s = {"Moshe", 1111};
```

`"Moshe"` fills `name` with `'M'`, `'o'`, `'s'`, `'h'`, `'e'`, and a terminating `'\0'`. The two remaining bytes of `name` are set to zero, and `id` holds 1111.

![One possible layout of Student at address 1000: eight name bytes followed by id.](../assets/figures/struct-moshe.svg)

The values in braces are matched to the members in declaration order: `{"Moshe", 1111}` gives `name` and then `id`. Order matters. In `{2222, "Omer"}`, the value 2222 is matched to `name`, and because it is not a string, it initializes `name[0]` alone. `"Omer"` then lands on `name[1]`, a single `char`, which cannot be initialized from a string, so the compiler rejects the line (GCC 14 reports an error). Members left out at the end are set to zero:

```c
struct Student s1 = {"Eden"}; /* id is 0; the unused bytes of name are 0 */
```

:::problem id=worked-moshe-layout title="Bytes of Moshe and 1111" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
`struct Student s = {"Moshe", 1111}` begins at address 1000. `name` is `char[8]` and `id` is `int`. On a platform where `id` has offset 8, list `name[0]` through `name[5]` and the address of `id`.

:::solution
`name[0]` through `name[4]` are `'M'`, `'o'`, `'s'`, `'h'`, and `'e'`. `name[5]` is `'\0'`, and `name[6]` and `name[7]` are 0. With no padding before `id`, its address is 1008 and its value is 1111. On an unknown platform, `offsetof(struct Student, id)` gives the offset.
:::
:::

## Names

:::definition id=def-typedef-struct title="Structure typedef" source="Lecture 1 - Introduction.pdf"
`typedef` gives an existing type a new name. After `typedef struct { ... } Student;`, the single word `Student` names that structure type.
:::

```c
typedef struct {
    char name[8];
    int id;
} Student;

int main(void) {
    Student s = {"Moshe", 1111};
    return 0;
}
```

This structure has no tag (no name after the word `struct`), so `struct Student` does not refer to it. Giving it a tag makes both spellings work:

```c
typedef struct Student {
    char name[8];
    int id;
} Student;
```

Both `Student s` and `struct Student s1` are then valid. Unlike C++ or Java, C does not let a structure declaration give its members default values, and it has no `static` members. The compiler rejects both of these:

```c
struct Student {
    char name[8] = "Moshe"; /* invalid */
    int id = 1111;          /* invalid */
};

struct S {
    int x;
    static int y; /* invalid */
};
```

## Members and input

The `.` operator selects a member of a structure object. For a pointer to a structure, `p->id` means `(*p).id`. The parentheses matter because `.` binds more tightly than unary `*`.

```c
Student s = {"Moshe", 1111};
printf("%s, %d\n", s.name, s.id);
```

`%s` prints characters until it reaches the terminating `'\0'`. Passing a `char` array with no terminator is undefined behavior.

A whole structure can be assigned to another of the same type, passed to a function, or returned from one; each of these copies every member. Arithmetic and comparison operators do not apply to structures, so this program is rejected:

```c
struct number {
    float x;
};

int main(void) {
    struct number n1, n2, n3;
    n1.x = 4;
    n2.x = 3;
    n3 = n1 + n2; /* invalid operands to binary + */
    return 0;
}
```

The addition has to use the members: `n3.x = n1.x + n2.x;` stores 7.0.

`scanf` needs the address of each object it fills. An array used as an argument becomes a pointer to its first element, so `s.name` is already a `char *`. `s.id` is a plain `int`, so it needs `&`. A string conversion also needs a width: `%7s` stores at most 7 characters plus the `'\0'`, which fits `char name[8]`.

```c
Student s;
if (scanf("%7s %d", s.name, &s.id) != 2) {
    return 1;
}
printf("name: %s, id: %d\n", s.name, s.id);
```

Without the width, a long name makes `%s` write past the end of the array. With `%7s`, a longer name is cut after 7 characters and the rest stays in the input for the next conversion. The return-value check catches missing or non-numeric input.

:::trap
Writing `&s.name` because "every `scanf` argument needs `&`". `s.name` already becomes the `char *` that `%s` expects; `&s.name` has the different type `char (*)[8]`, a pointer to the whole array. `s.id` is an `int`, so it does need `&`.
:::

## Practice

:::problem id=prac-sizeof-two-ints title="sizeof of a two-int struct" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
```c
struct st {
    int x;
    int y;
};
```
The program prints `sizeof(struct st)` with `%zu`. On this platform, `int` occupies 4 bytes and is aligned to 4 bytes.

:::check id=prac-sizeof-two-ints-q1
The program prints {{=8|4|a compiler error}}.

Two aligned 4-byte members occupy 8 bytes, and this structure needs no padding on this platform. The general rule is to use the value `sizeof` produces.
:::

:::check id=prac-sizeof-two-ints-q2
The result is 8 on this platform because

- [x] The structure holds two 4-byte `int` members and needs no padding here
- [ ] `sizeof` always returns the size of one member
- [ ] A structure with two members is a run-time error

The program is valid. `sizeof` always includes padding; for these two members there is none.
:::
:::

:::problem id=prac-struct-sum title="Adding two struct values" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
```c
struct number {
    float x;
};

int main(void) {
    struct number n1, n2, n3;
    n1.x = 4;
    n2.x = 3;
    n3 = n1 + n2;
    printf("%f", n3.x);
    return 0;
}
```

:::check id=prac-struct-sum-q1
The program as written {{=does not compile|prints 7.000000|prints an unspecified float}}.

The compiler reports invalid operands to `+`. A structure does not gain arithmetic operators because one of its members has them.
:::

:::check id=prac-struct-sum-q2
The repaired assignment is {{=n3.x = n1.x + n2.x|n3 = n1.x + n2.x|n3 = sizeof(n1) + sizeof(n2)}}.

The addition must use the `float` members. Assignment of one whole structure to another is legal, but addition of the two structure values is not.
:::

:::check id=prac-struct-sum-q3
After that repair, `printf("%f", n3.x)` prints {{=7.000000|7|4.000000}}.

The sum is `4 + 3`, and `%f` prints six digits after the decimal point by default.
:::
:::

:::problem id=prac-initializer-order title="Brace lists and typedef names" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The type is `struct Student { char name[8]; int id; }`.

:::check id=prac-initializer-order-q1
`struct Student s1 = {"Eden"};` sets `id` to {{=0|an indeterminate value|1111}}.

A trailing omitted member is zero-initialized. The initializer means `{"Eden", 0}`.
:::

:::check id=prac-initializer-order-q2
`struct Student s2 = {2222, "Omer"};` {{=does not compile|sets id to 2222 and name to Omer|swaps the members at run time}}.

Values are matched to members in order. 2222 goes to `name[0]`, and `"Omer"` then goes to `name[1]`, a single `char` that cannot hold a string.
:::

:::check id=prac-initializer-order-q3
After `typedef struct { char name[8]; int id; } Student;`, which declaration is valid?

- [x] `Student s = {"Moshe", 1111};`
- [ ] `struct Student s1 = {"Omer", 2222};`
- [ ] A `static` member declared inside the structure

The alias is `Student`. The structure has no tag, so `struct Student` does not name it. Adding the tag `struct Student` makes both forms available. C has no `static` structure members.
:::
:::

:::problem id=prac-field-scanf title="Addresses passed to scanf" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
`Student` has `char name[8]` and `int id`.

:::check id=prac-field-scanf-q1
The bounded call is {{=scanf("%7s %d", s.name, &s.id)|scanf("%s %d", &s.name, s.id)|scanf("%s %d", &s.name, &s.id)}}.

`s.name` decays to the address of the first character. `%7s` leaves room for the NUL in an 8-byte array. `s.id` is an `int`, so it needs `&`. The call is successful only when its result is 2.
:::

:::check id=prac-field-scanf-q2
`%s` prints `s.name` through {{=the terminating NUL|exactly 8 characters, including bytes after the name|the id member}}.

`%s` stops at `'\0'`. It does not use the array length, so the array must contain a terminator.
:::
:::

:::problem id=prac-three-students title="Three students from input" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Read three students. Each one has a name of at most 9 characters, a faculty of at most 4 characters, an id, and five grades.

```c
typedef struct {
    char name[10];
    char faculty[5];
    int id;
    int grades[5];
} Student;

int main(void) {
    Student students[3];
    for (int i = 0; i < 3; i++) {
        if (scanf("%9s %4s %d", students[i].name, students[i].faculty,
                  &students[i].id) != 3) {
            return 1;
        }
        for (int j = 0; j < 5; j++) {
            if (scanf("%d", &students[i].grades[j]) != 1) {
                return 1;
            }
        }
    }
    return 0;
}
```

:::check id=prac-three-students-q1
`students[i].name` is passed to `scanf` {{=without an extra ampersand|with an ampersand before the array|as an int conversion}}.

The member is an array. In this argument it decays to a pointer to its first element. The matching width is `%9s` because `name` holds 10 bytes including the NUL.
:::

:::check id=prac-three-students-q2
`students[i].id` and `students[i].grades[j]` are passed {{=with an ampersand|without an ampersand|through %s}}.

Both expressions designate `int` objects. `scanf` needs their addresses, and the conversion is `%d`.
:::

:::check id=prac-three-students-q3
How many grades does the inner loop read for each student? {{=5|3|10}}

`j` runs from 0 through 4. Each iteration reads one `%d` into `grades[j]`.
:::
:::

:::trap
Using `%s` without a width for `name` or `faculty`. `faculty` holds only 4 characters plus `'\0'`, so a 5-letter faculty name would overflow it. The widths `%9s` and `%4s` keep each string inside its array.
:::

[Programs and processes](topic:source-to-process) places objects with static and automatic storage into the address space of a running program.
