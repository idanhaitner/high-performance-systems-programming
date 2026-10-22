---
id: structures
title: Structures
sources:
  - "Lecture 1 - Introduction.pdf"
---

An array is a contiguous run of one type. A structure is also a contiguous run of elements (רצף של אלמנטים), and, as with an array (מערך), the elements need not share a type. The field order in the type is the order of the bytes, and it is the order of an initializer.

## A structure is a mixed run of bytes

:::definition id=def-struct title="Structure" source="Lecture 1 - Introduction.pdf"
A structure is a collection of variables of possibly different types. Declaring `struct Student { ... };` introduces a new type. An object of that type occupies a contiguous region whose fields appear in the order they are written.
:::

```c
struct Student {
    char name[8];
    int id;
};

int main() {
    struct Student s;
}
```

`name` is 8 bytes. `id` is a 4-byte `int` placed after those 8 bytes. If `s` is drawn at address 1000, `name[0]` is at 1000 and `id` is at 1008.

```c
struct Student s = {"Moshe", 1111};
```

`"Moshe"` is a string: an array of characters with a `'\0'` at the end. The eight bytes of `name` are `'M'`, `'o'`, `'s'`, `'h'`, `'e'`, `'\0'`, and two zero bytes. `id` holds 1111.

![Student s at address 1000: the eight name bytes, then the int id.](../assets/figures/struct-moshe.svg)

:::theorem id=thm-field-order title="Initializer order is field order" source="Lecture 1 - Introduction.pdf"
In `struct Student { char name[8]; int id; }`, the initializer lists a value for `name` and then a value for `id`. An initializer whose first value is an `int` and whose second value is a string does not match this type.

:::proof
**Intuition.** The brace list is positional. The compiler has no names inside the braces, so it walks the fields from top to bottom.

**Proof.** The initialization list corresponds to the structure's fields in the same order. `{"Moshe", 1111}` therefore writes the string into `name` and the integer into `id`. The list `{2222, "Omer"}` supplies an integer where `name` expects a character array and a string where `id` expects an `int`. That line is a compilation error.

**What the proof used.** The field order in the type, and the rule that the brace list follows that order.
:::
:::

A missing tail of the list is completed with zeros.

```c
struct Student s = {"Moshe", 1111};
struct Student s1 = {"Eden"}; /* same as {"Eden", 0} */
```

`s1.id` is 0. The characters of `"Eden"` occupy `name`, and the rest of that array is zero, including the terminating `'\0'`.

:::problem id=worked-moshe-layout title="Bytes of Moshe and 1111" source="Lecture 1 - Introduction.pdf" kind=worked solution_origin=source
`struct Student s = {"Moshe", 1111}` is drawn at address 1000, with `char name[8]` before `int id`. List `name[0]` through `name[5]` and the address of `id`.

:::solution
`name[0]` through `name[4]` are `'M'`, `'o'`, `'s'`, `'h'`, `'e'`. `name[5]` is `'\0'`. The two remaining name bytes are 0. `id` starts after the 8-byte array, at address 1008, and holds 1111.
:::
:::

Two `int` fields and nothing else are the size example.

```c
struct st {
    int x;
    int y;
};

int main() {
    printf("%d", sizeof(struct st));
    return 0;
}
```

:::theorem id=thm-sizeof-st title="sizeof of two ints" source="Lecture 1 - Introduction.pdf"
`sizeof(struct st)` for `struct st { int x; int y; }` is 8.

:::proof
**Intuition.** The object is the two fields one after another, and each `int` is 4 bytes.

**Proof.** `sizeof(struct st)` is the size of `int` plus the size of `int`, which is 8, and the program prints 8. The other candidates, 4, a compiler error, and a runtime error, are wrong.

**What the proof used.** The 4-byte `int`, and the addition of the two fields for this struct.
:::
:::

:::trap
Adding the field widths by hand and ignoring `sizeof` when a later struct inserts padding for alignment. A two-`int` struct is 8, and `char[8]` plus `int` is drawn with `id` immediately after the array. When you need the size of an object, `sizeof` is the measurement. For this struct the printed size is 8.
:::

## typedef

:::definition id=def-typedef-struct title="A structure typedef" source="Lecture 1 - Introduction.pdf"
`typedef struct { ... } Student;` makes `Student` a type name. Declarations then use `Student s` and do not repeat the `struct` keyword.
:::

```c
typedef struct {
    char name[8];
    int id;
} Student;

int main() {
    Student s = {"Moshe", 1111};
    struct Student s1 = {"Omer", 2222}; /* compilation error */
}
```

The `struct Student` form is unavailable here because the struct in the `typedef` was anonymous. Naming it on the way through restores both spellings:

```c
typedef struct Student {
    char name[8];
    int id;
} Student;

int main() {
    Student s = {"Moshe", 1111};
    struct Student s1 = {"Omer", 2222}; /* both forms are valid */
}
```

## Reading and writing fields

The operator `.` selects a field.

```c
Student s = {"Moshe", 1111};
printf("%s, %d", s.name, s.id);
```

`%s` prints a string, an array of characters with `'\0'` at the end. The output is the characters of `name` and the integer `id`.

Fields can also be filled after the object exists. The array name is already an address, so `scanf` does not take `&` on `s.name`. The `int` is not an address, so `scanf` does take `&` on `s.id`.

```c
Student s;
printf("Enter name and id: ");
scanf("%s %d", s.name, &(s.id));
printf("name: %s, id: %d", s.name, s.id);
```

The sample input is `Moshe` and `1111`, and the printf that follows prints those fields.

Two writings are compilation errors. A field cannot be given a value inside the type itself, and a struct type cannot have a `static` member.

```c
struct Student {
    char name[8] = "Moshe"; /* compilation error */
    int id = 1111;
};

struct S {
    int x;
    static int y; /* compilation error */
};
```

A struct also has no `+`. This program declares `struct number { float x; }`, sets `n1.x = 4` and `n2.x = 3`, and then writes `n3 = n1 + n2`. The compiler reports `invalid operands to binary +` with the two operands of type `struct number`. The repair adds the fields: `n3.x = n1.x + n2.x`. That program prints 7.

:::trap
Writing `&s.name` in `scanf` because every `scanf` argument "needs an ampersand". The rule is the address of the object being written. The array name `s.name` is already that address. `s.id` is an `int`, so it still needs `&`.
:::

## Practice

:::problem id=prac-sizeof-two-ints title="sizeof of a two-int struct" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
```c
struct st {
    int x;
    int y;
};
```
`printf("%d", sizeof(struct st));` asks for the size. `int` is 4 bytes.

:::check id=prac-sizeof-two-ints-q1
The program prints {{=8|4|a compiler error}}.

The candidates are 4, 8, a compiler error, and a runtime error. The computed size is `sizeof(int) + sizeof(int)`, and the printed answer is 8.
:::

:::check id=prac-sizeof-two-ints-q2
The result is 8 because

- [x] The struct holds two `int` fields and each is 4 bytes in this model
- [ ] `sizeof` always returns the size of one field
- [ ] A struct with two fields is a runtime error

The two `int` widths add. The program compiles and prints that sum.
:::
:::

:::problem id=prac-struct-sum title="Adding two struct values" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
```c
struct number {
    float x;
};

int main() {
    struct number n1, n2, n3;
    n1.x = 4;
    n2.x = 3;
    n3 = n1 + n2;
    printf("%f", n3.x);
    return 0;
}
```

:::check id=prac-struct-sum-q1
The program as written {{=is a compiler error|prints 7|prints an unpredictable float}}.

The diagnostic is `invalid operands to binary +` for two values of type `struct number`.
:::

:::check id=prac-struct-sum-q2
The repaired assignment is {{=n3.x = n1.x + n2.x|n3 = n1.x + n2.x|n3 = sizeof(n1) + sizeof(n2)}}.

The addition has to be on the `float` fields. The struct values themselves have no `+`.
:::

:::check id=prac-struct-sum-q3
After that repair, `printf("%f", n3.x)` prints {{=7|4|0}}.

`4 + 3` is 7, stored in `n3.x`.
:::
:::

:::problem id=prac-initializer-order title="Brace lists and typedef names" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`struct Student { char name[8]; int id; }`.

:::check id=prac-initializer-order-q1
`struct Student s1 = {"Eden"};` sets `id` to {{=0|unspecified garbage|1111}}.

A missing initializer is completed with 0. The line means `{"Eden", 0}`.
:::

:::check id=prac-initializer-order-q2
`struct Student s2 = {2222, "Omer"};` {{=is a compilation error|sets id to 2222 and name to Omer|swaps the fields at run time}}.

The first initializer is matched with `name`, a `char[8]`. An `int` in that position does not match.
:::

:::check id=prac-initializer-order-q3
After `typedef struct { char name[8]; int id; } Student;`, which declarations are legal?

- [x] `Student s = {"Moshe", 1111};`
- [ ] `struct Student s1 = {"Omer", 2222};`
- [ ] A `static` member written inside the struct type

The anonymous struct behind the typedef has no `struct Student` tag. Combining `typedef struct Student { ... } Student;` restores both names. `static` inside the type is a compilation error.
:::
:::

:::problem id=prac-field-scanf title="Addresses passed to scanf" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
`Student` has `char name[8]` and `int id`.

:::check id=prac-field-scanf-q1
The call is {{=scanf("%s %d", s.name, &s.id)|scanf("%s %d", &s.name, s.id)|scanf("%s %d", &s.name, &s.id)}}.

`s.name` is the address of the first character. `s.id` is an `int`, so `scanf` needs `&s.id`. `&(s.id)` is the same address.
:::

:::check id=prac-field-scanf-q2
`%s` prints `s.name` through {{=the terminating NUL|exactly 8 characters, including bytes after the name|the id field}}.

A string is a character array with `'\0'` at the end. `%s` stops at that byte.
:::
:::

:::problem id=prac-three-students title="Three students from input" source="Lecture 1 - Introduction.pdf" kind=exercise solution_origin=source
Write a program that reads three students, each with a name, an id, a faculty, and five exam grades. One complete version is:

```c
typedef struct {
    char name[10];
    char faculty[5];
    int id;
    int grades[5];
} Student;

int main() {
    Student students[3];
    for (int i = 0; i < 3; i++) {
        printf("Enter name, faculty and id: ");
        scanf("%s%s%d", students[i].name, students[i].faculty, &(students[i].id));
        printf("Enter five grades: ");
        for (int j = 0; j < 5; j++)
            scanf("%d", &(students[i].grades[j]));
    }
    return 0;
}
```

:::check id=prac-three-students-q1
`students[i].name` is passed to `scanf` {{=without an ampersand|with an ampersand|as an int conversion}}.

The field is an array. Its name is the address `scanf` writes into. The same is true of `faculty`.
:::

:::check id=prac-three-students-q2
`students[i].id` and `students[i].grades[j]` are passed {{=with an ampersand|without an ampersand|as %s}}.

Both are `int` objects. `scanf` needs their addresses. The grade conversion is `%d`.
:::

:::check id=prac-three-students-q3
How many grades does the inner loop read for each student? {{=5|3|10}}

`j` runs from 0 to 4, one `%d` per grade, into `grades[5]`.
:::
:::

:::trap
`faculty` is `char[5]`. A string needs a byte for `'\0'`, so a faculty token of 5 letters does not fit, and `%s` has no width limit. The loop is the right shape for three students and five grades. The array sizes are the bound on what a safe token can be.
:::

Command-line words are another place where strings, pointers, and `scanf`-style conversions meet. [Command-line arguments](topic:command-line-arguments) receives them through `main` instead of through `scanf`.
