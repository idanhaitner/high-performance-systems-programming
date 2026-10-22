---
id: structures
title: Structures
sources:
  - "Lecture 1 - Introduction.pdf"
  - c/10-structs/lesson.md
---

An array is a contiguous sequence of one element type. A structure is one object with named members, and those members may have different types. Members are allocated in declaration order at increasing addresses. The compiler may insert padding so a member satisfies its alignment, and it may add trailing padding so the structure's size is a multiple of that alignment. `sizeof` is the size of the whole object. It is not always the sum of the member sizes.

## Layout

:::definition id=def-struct title="Structure" source="Lecture 1 - Introduction.pdf"
A structure type declares named members. An object of that type stores those members in declaration order. Their offsets are implementation-defined and can be measured with `offsetof` from `<stddef.h>`.
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

`name` is an array of 8 `char`. On this platform `int` has size and alignment 4. Eight is a multiple of 4, so `id` can begin immediately after `name`, at offset 8. If `s` begins at address 1000, `name[0]` is at 1000 and `id` is at 1008. `sizeof(struct Student)` is 12 on this platform: 8 bytes, followed by a 4-byte `int`, with no extra padding. Another ABI can choose a different alignment and size.

A member sequence that does not already meet the next alignment is different:

```c
struct tagged {
    char tag;
    int value;
};
```

With 4-byte alignment for `int`, a compiler commonly inserts 3 padding bytes after `tag`. The size is then 8, not 5. The padding bytes are not members.

```c
struct Student s = {"Moshe", 1111};
```

`"Moshe"` initializes the array with `'M'`, `'o'`, `'s'`, `'h'`, `'e'`, and a terminating `'\0'`. The two bytes not covered by that initializer are zero. `id` holds 1111.

![One possible layout of Student at address 1000: eight name bytes followed by id.](../assets/figures/struct-moshe.svg)

A brace initializer assigns members in order. `{"Moshe", 1111}` matches `name` and then `id`. `{2222, "Omer"}` supplies an `int` where a `char[8]` is expected, which is a constraint violation. Omitted trailing members are initialized as if they had static storage duration, so they become zero.

```c
struct Student s = {"Moshe", 1111};
struct Student s1 = {"Eden"}; /* id is 0; the rest of name is 0 */
```

`"Eden"` includes its terminator. The remaining bytes of `name` are zero, and `s1.id` is 0.

:::problem id=worked-moshe-layout title="Bytes of Moshe and 1111" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=derived
`struct Student s = {"Moshe", 1111}` begins at address 1000. `name` is `char[8]` and `id` is `int`. On a platform where `id` has offset 8, list `name[0]` through `name[5]` and the address of `id`.

:::solution
`name[0]` through `name[4]` are `'M'`, `'o'`, `'s'`, `'h'`, and `'e'`. `name[5]` is `'\0'`. The other two bytes of `name` are 0. With no padding before `id`, its address is 1008 and its value is 1111. `offsetof(struct Student, id)` is the measurement if the platform is unknown.
:::
:::

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

On this platform each `int` occupies 4 bytes and has 4-byte alignment, so this structure has no padding and the program prints 8. The result is `sizeof(struct st)`, not a sum written by hand. The conversion is `%zu`.

:::trap
Adding member widths and using the sum as the object size. Padding can make `sizeof` larger. For the two-`int` structure on this platform the sum and `sizeof` happen to agree at 8.
:::

## Names

:::definition id=def-typedef-struct title="Structure typedef" source="Lecture 1 - Introduction.pdf"
`typedef` creates an alias. After `typedef struct { ... } Student;`, the name `Student` denotes that structure type.
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

This struct has no tag, so `struct Student` is not a type. Naming the tag provides both spellings:

```c
typedef struct Student {
    char name[8];
    int id;
} Student;
```

Both `Student s` and `struct Student s1` are then valid. C does not allow a member to be initialized in the type declaration, and it does not have `static` members. Both of the following are constraint violations:

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

`%s` writes characters until the terminating NUL. Passing a `char` array that is not terminated is undefined behavior.

A structure value can be assigned or passed as an argument. The assignment copies the representation, including padding. There is no `+` operator for structure values. This program is rejected:

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

The addition has to name the numeric member: `n3.x = n1.x + n2.x`. That stores 7.

`scanf` needs a pointer to the object it writes. An array member converts to the address of its first element, so `s.name` is already a `char *`. An `int` member does not convert to a pointer, so `s.id` needs `&`. The string conversion also needs a field width. `%7s` stores at most 7 characters plus a NUL, which fits in `char name[8]`.

```c
Student s;
if (scanf("%7s %d", s.name, &s.id) != 2) {
    return 1;
}
printf("name: %s, id: %d\n", s.name, s.id);
```

Without the width, `%s` can write past the array. A token longer than 7 characters is truncated by `%7s`; checking the return value does not by itself reject that truncation, but it does reject missing input.

:::trap
Writing `&s.name` because every `scanf` argument appears to need an ampersand. `s.name` is an array and already decays to the required pointer. `&s.name` has type pointer-to-array. `s.id` is an `int`, so it still needs `&`.
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

The program is valid. The printed size includes any padding the ABI inserts; for these two members that amount is zero.
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
The program as written {{=is a constraint violation|prints 7|prints an unspecified float}}.

The compiler diagnoses invalid operands to `+`. A structure type has no arithmetic operators merely because one of its members does.
:::

:::check id=prac-struct-sum-q2
The repaired assignment is {{=n3.x = n1.x + n2.x|n3 = n1.x + n2.x|n3 = sizeof(n1) + sizeof(n2)}}.

The addition must use the `float` members. Assignment of one whole structure to another is legal, but addition of the two structure values is not.
:::

:::check id=prac-struct-sum-q3
After that repair, `printf("%f", n3.x)` prints {{=7|4|0}}.

The member calculation is `4 + 3`.
:::
:::

:::problem id=prac-initializer-order title="Brace lists and typedef names" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
The type is `struct Student { char name[8]; int id; }`.

:::check id=prac-initializer-order-q1
`struct Student s1 = {"Eden"};` sets `id` to {{=0|an indeterminate value|1111}}.

A trailing omitted member is zero-initialized. The initializer means `{"Eden", 0}`.
:::

:::check id=prac-initializer-order-q2
`struct Student s2 = {2222, "Omer"};` {{=is a constraint violation|sets id to 2222 and name to Omer|swaps the members at run time}}.

The first initializer is matched with `name`, whose type is `char[8]`. An `int` does not match that member.
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
`faculty` can hold 4 characters plus `'\0'`. A conversion of `%s` with no width can write beyond either array. The loop shape reads three records of five grades; the widths `%9s` and `%4s` are what make those reads fit.
:::

[Programs and processes](topic:source-to-process) places objects with static and automatic storage into the address space of a running program.
