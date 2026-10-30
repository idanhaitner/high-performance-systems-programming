---
id: structures
title: Structures
sources:
  - "Lecture 1 - Introduction.pdf"
---

An array groups many values of the **same** type. But real things are made of different kinds of values. A student, for example, has a name (text) and an ID (a number). A **structure** (`struct`) lets you bundle those into one variable. This lesson shows how to define a structure, fill it, use its parts, and finally how it is laid out in memory, including the hidden gaps the compiler sometimes adds.

## Defining and using a structure

A structure is like a form with labeled fields. First you describe the form (the **type**), then you make variables of that type.

```c
struct Student {     /* describe a new type called "struct Student" */
    char name[8];    /* field 1: up to 7 letters plus the ending '\0' */
    int id;          /* field 2: a whole number */
};

int main(void) {
    struct Student s;   /* make one variable of that type */
    return 0;
}
```

The fields are called **members**. The description alone creates no variable; it is only a blueprint. `struct Student s;` makes an actual student variable called `s`.

:::definition id=def-struct title="Structure" source="Lecture 1 - Introduction.pdf"
A structure is a type made of named members, which can have different types. The members are stored in memory in the order you wrote them.
:::

### Reaching a member: the dot

Use a dot to reach a member: `s.name` is the student's name, `s.id` is the ID.

```c
struct Student s = {"Moshe", 1111};
printf("%s, %d\n", s.name, s.id);   /* prints: Moshe, 1111 */
```

`%s` prints a string: it prints characters until it reaches the ending `'\0'`. (If there is no `'\0'`, it keeps reading past the array, which is a bug.)

If you have a **pointer** to a structure, use an arrow: `p->id`. It is a short way to write `(*p).id`: "follow the pointer, then take the `id` member". The parentheses in `(*p).id` are needed because the dot is applied before the star.

## Giving a structure starting values

```c
struct Student s = {"Moshe", 1111};
```

The values in the braces are given to the members **in order**: the first value to the first member (`name`), the second to the second (`id`). So `name` gets `'M'`, `'o'`, `'s'`, `'h'`, `'e'`, then the ending `'\0'`. The two leftover bytes of `name` are set to 0. `id` gets 1111.

![One possible layout of Student at address 1000: eight name bytes followed by id.](../assets/figures/struct-moshe.svg)

**Order matters.** `{2222, "Omer"}` does not work. C gives 2222 to `name`, and since 2222 is not text, it goes into `name[0]` alone. Then `"Omer"` would go into `name[1]`, a single character, which cannot hold text. The compiler reports an error.

**Missing values become 0.** If you give fewer values than there are members, the rest are set to zero:

```c
struct Student s1 = {"Eden"}; /* id is 0; the unused bytes of name are 0 */
```

## A shorter name with typedef

Writing `struct Student` every time is long. `typedef` gives a type a new name.

:::definition id=def-typedef-struct title="Structure typedef" source="Lecture 1 - Introduction.pdf"
`typedef` gives an existing type another name. After `typedef struct { ... } Student;`, you can write just `Student` for that structure type.
:::

```c
typedef struct {
    char name[8];
    int id;
} Student;

int main(void) {
    Student s = {"Moshe", 1111};   /* no "struct" needed */
    return 0;
}
```

Here the structure itself has no name after the word `struct`, so `struct Student` does **not** work; only `Student` does. If you want both spellings, give the structure a name too:

```c
typedef struct Student {
    char name[8];
    int id;
} Student;
```

Now both `Student s` and `struct Student s1` are valid.

### Things C structures cannot do

If you know Java or C++, note that C structures are simpler. You **cannot** give members default values inside the definition, and there are no `static` members. Both of these are errors:

```c
struct Student {
    char name[8] = "Moshe"; /* error: no default values here */
    int id = 1111;          /* error */
};

struct S {
    int x;
    static int y; /* error: no static members */
};
```

## What you can do with a whole structure

You **can** copy a whole structure with `=`, pass it to a function, and return it from a function. Each of these copies every member.

You **cannot** use math or comparison operators (`+`, `-`, `==`, `<`) on whole structures. C does not know what "adding two students" would mean:

```c
struct number {
    float x;
};

int main(void) {
    struct number n1, n2, n3;
    n1.x = 4;
    n2.x = 3;
    n3 = n1 + n2; /* error: + does not work on structures */
    return 0;
}
```

To add, work with the members: `n3.x = n1.x + n2.x;` stores 7.0.

## Reading a structure with scanf

Recall that `scanf` needs the **address** of each variable it fills.

- `s.id` is an `int`, so you write `&s.id`.
- `s.name` is an array. As we saw in the last lesson, an array's name already acts as the address of its first element. So you write just `s.name`, **without** `&`.

Also, always limit how many characters `%s` may read. `name` has room for 8 bytes: 7 letters plus `'\0'`. So use `%7s`:

```c
Student s;
if (scanf("%7s %d", s.name, &s.id) != 2) {
    return 1;   /* fewer than 2 values were read: stop */
}
printf("name: %s, id: %d\n", s.name, s.id);
```

Without the 7, a long name would be written past the end of the array and overwrite other memory. With `%7s`, a longer name is cut after 7 letters. The check `!= 2` makes sure both values were read.

:::trap
Writing `&s.name` because "`scanf` always needs `&`". `s.name` is an array, so it already gives the address `%s` needs. `s.id` is a plain `int`, so it does need `&`.
:::

## How a structure sits in memory: padding

The members are stored in order, but not always tightly packed. The reason is **alignment**: the processor reads an `int` fastest (and on some machines, only) when its address is a multiple of 4. So the compiler makes sure each member starts at a suitable address, and if needed it leaves empty bytes, called **padding**, in between.

**Example without padding.** In `struct Student`, `name` takes bytes 0 to 7. The next free spot is byte 8, which is a multiple of 4, so `id` fits right there. Total: 8 + 4 = 12 bytes.

**Example with padding.**

```c
struct tagged {
    char tag;    /* 1 byte, at offset 0 */
    int value;   /* 4 bytes, but cannot start at offset 1 */
};
```

`tag` takes byte 0. The next free byte is 1, which is not a multiple of 4. So the compiler skips bytes 1, 2, and 3 (padding) and puts `value` at byte 4. The total size is **8**, not 5. The 3 padding bytes belong to no member. (The compiler may also add padding at the end, so that in an array of these structures, every element stays aligned.)

`sizeof` always gives the true size, padding included:

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

Two 4-byte `int`s, both naturally aligned, no padding needed: this prints 8.

:::trap
Adding up the member sizes to get the structure's size. Padding can make it bigger, as with `struct tagged` (1 + 4 = 5 bytes of members, but `sizeof` is 8). Always use `sizeof`.
:::

## Practice

:::problem id=prac-struct-padding title="Padding in a three-member struct" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
```c
struct trio {
    char a;
    int b;
    char c;
};
```

On this machine, `int` is 4 bytes and must start at a multiple of 4. The whole structure's size is also rounded up to a multiple of 4, so that every element of an array of structures stays aligned. As written, `sizeof(struct trio)` is 12.

:::check id=prac-struct-padding-q1
Reorder the members to `int b; char a; char c;`. Now `sizeof` is {{=8|6|12}}.

`b` takes bytes 0 to 3, `a` takes byte 4, and `c` takes byte 5. Six bytes are used, and rounding up to a multiple of 4 gives 8. The order of the members changes the size.
:::

:::check id=prac-struct-padding-q2
In the order `char a; char c; int b;`, `b` starts at offset {{=4|2|1}}.

`a` and `c` take bytes 0 and 1. `b` must start at a multiple of 4, so bytes 2 and 3 are padding.
:::

:::check id=prac-struct-padding-q3
With the original order and `struct trio t[3];`, `t[1].c` is how many bytes after the start of `t`? {{=20|13|9}}

`t[1]` starts after one whole structure, at 12. `c` is at offset 8 inside it, and $12 + 8 = 20$.
:::
:::

:::problem id=prac-struct-copy title="Copying and comparing structures" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
```c
struct box {
    int v[2];
    int *p;
};

int main(void) {
    int n = 1;
    struct box b1 = {{1, 2}, &n};
    struct box b2 = b1;
    b2.v[0] = 5;
    *b2.p = 9;
    printf("%d %d\n", b1.v[0], n);
    return 0;
}
```

:::check id=prac-struct-copy-q1
The program prints {{=1 9|5 9|1 1}}.

`b2 = b1` copies every member. The array is copied too, so `b2.v[0] = 5` leaves `b1.v[0]` at 1. The pointer is also copied, but both copies hold the address of `n`, so `*b2.p = 9` changes `n`.
:::

:::check id=prac-struct-copy-q2
Adding the line `if (b1 == b2) { ... }` {{=does not compile|compares every member|compares the addresses}}.

`==` does not work on whole structures. To compare them, compare the members yourself.
:::
:::

:::problem id=prac-initializer-order title="Brace lists and typedef names" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new type: `struct Item { char code[4]; int qty; double price; };`.

:::check id=prac-initializer-order-q1
`struct Item it = {"AB", 3};` sets `price` to {{=0|an indeterminate value|3}}.

Members you leave out at the end are set to 0. `code` gets `"AB"` and `qty` gets 3.
:::

:::check id=prac-initializer-order-q2
`struct Item it = {3, "AB"};` {{=does not compile|sets qty to 3 and code to AB|swaps the members at run time}}.

Values go to members in order. 3 goes into `code[0]`, then `"AB"` would go into `code[1]`, a single character, which cannot hold text.
:::

:::check id=prac-initializer-order-q3
After `typedef struct { char code[4]; int qty; } Item;`, which line is valid?

- [x] `Item it = {"AB", 3};`
- [ ] `struct Item it = {"AB", 3};`
- [ ] `Item it = {qty = 3};`

The new name is `Item`. The structure itself has no name after `struct`, so `struct Item` does not exist.
:::
:::

:::problem id=prac-field-scanf title="Addresses passed to scanf" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
A new type: `typedef struct { char city[12]; int zip; } Address;` and a variable `Address a;`.

:::check id=prac-field-scanf-q1
The safe, correct call is {{=scanf("%11s %d", a.city, &a.zip)|scanf("%12s %d", &a.city, a.zip)|scanf("%s %d", &a.city, &a.zip)}}.

`a.city` is an array, so it is already an address. It has 12 bytes, so `%11s` leaves room for the `'\0'`. `a.zip` is an `int`, so it needs `&`.
:::

:::check id=prac-field-scanf-q2
The call is `scanf("%11s %d", a.city, &a.zip)`, and the user types a 15-letter word and then `84105`. What happens? {{=scanf returns 1, and zip is not set|the extra letters are dropped, and zip is 84105|city overflows its array}}

`%11s` stops after 11 letters, and the other 4 stay waiting. `%d` then meets letters, not digits, so it stores nothing. `scanf` stored only one value, so it returns 1.
:::
:::

:::problem id=prac-three-students title="Three students from input" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=derived
Read three students. Each one has a name of at most 9 letters, a faculty of at most 4 letters, an ID, and five grades.

```c
typedef struct {
    char name[10];
    char faculty[5];
    int id;
    int grades[5];
} Student;

int main(void) {
    Student students[3];               /* an array of 3 students */
    for (int i = 0; i < 3; i++) {
        if (scanf("%9s %4s %d", students[i].name, students[i].faculty,
                  &students[i].id) != 3) {
            return 1;
        }
        for (int j = 0; j < 5; j++) {  /* read the 5 grades */
            if (scanf("%d", &students[i].grades[j]) != 1) {
                return 1;
            }
        }
    }
    return 0;
}
```

:::check id=prac-three-students-q1
Using the rule that an `int` starts at a multiple of 4, `sizeof(Student)` is {{=40|39|44}}.

`name` and `faculty` use bytes 0 to 14. Byte 15 is padding, so `id` starts at 16. The five grades are bytes 20 to 39, which makes 40.
:::

:::check id=prac-three-students-q2
Which expression is the last grade of the last student? {{=students[2].grades[4]|students[3].grades[5]|students.grades[2][4]}}

Both arrays count from 0, so the last indexes are 2 and 4. The student comes first, then the member, then the grade.
:::

:::check id=prac-three-students-q3
The input starts with `Dana Medicine 123`. What happens?

- [x] `faculty` gets `Medi`, `%d` then meets `cine`, so `scanf` returns 2 and `main` returns 1
- [ ] `faculty` overflows its array, and `id` gets 123
- [ ] `faculty` gets `Medi`, the rest of the word is dropped, and `id` gets 123

`%4s` protects the array by stopping after 4 letters, but the other letters stay waiting. The check `!= 3` catches the failure.
:::
:::

:::trap
Using `%s` with no number for `name` or `faculty`. `faculty` has room for only 4 letters plus `'\0'`, so a 5-letter faculty would overflow it. `%9s` and `%4s` keep each string inside its array.
:::

**Next:** [Programs and processes](topic:source-to-process) follows your C file as it becomes a running program, and shows where globals, locals, and code end up in memory.
