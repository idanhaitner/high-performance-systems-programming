---
id: strings
title: Working with strings
sources:
  - "ps1 (1).pdf"
---

The last lesson printed and read text with `%s`. This lesson looks at how C stores that text, and at the library functions that work with it: measuring a string, copying it, joining two strings, comparing them, finding something inside one, and splitting one into words. C has no special "text" type, so every one of these is just a loop over an array of characters. Seeing that makes the rules (and the crashes) easy to understand.

## A string is an array that ends with '\0'

In [Memory and pointers](topic:memory-and-pointers) you saw that a string is an array of `char` that ends with the special character `'\0'`, whose code is 0.

```c
char name[] = "Dana";
```

This array has **5** cells, not 4:

| `name[0]` | `name[1]` | `name[2]` | `name[3]` | `name[4]` |
| --- | --- | --- | --- | --- |
| `'D'` | `'a'` | `'n'` | `'a'` | `'\0'` |

The text has 4 characters, and the compiler adds the end marker `'\0'` for you. Every string function finds the end of the text by looking for that 0. If it is missing, the function keeps reading past the end of the array into whatever memory comes next.

:::definition id=def-string title="String" source="ps1 (1).pdf"
A string in C is a sequence of characters stored in a `char` array and ended by the character `'\0'` (code 0). Its length is the number of characters before the `'\0'`, so the array needs at least length + 1 cells.
:::

## The string toolbox: string.h

The standard library has many string functions. To use them, write `#include <string.h>` at the top of your file.

| Function | What it does | Example |
| --- | --- | --- |
| `strlen(s)` | counts the characters before `'\0'` | `strlen("hello")` is 5 |
| `strcpy(dest, src)` | copies `src`, with its `'\0'`, into `dest` | after `strcpy(d, "hi")`, `d` is `"hi"` |
| `strncpy(dest, src, n)` | copies at most `n` characters | `strncpy(d, "hi!", 2)` copies `h` and `i` |
| `strcat(dest, src)` | adds `src` to the end of `dest` | `"hi"` becomes `"hi!"` after `strcat(d, "!")` |
| `strncat(dest, src, n)` | adds at most `n` characters | `strncat(d, "ya", 1)` adds only `y` |
| `strcmp(a, b)` | compares two strings | `strcmp("a", "b")` is negative |
| `strncmp(a, b, n)` | compares at most `n` characters | `strncmp("ab", "ac", 1)` is 0 |
| `strchr(s, c)` | finds the first character `c` in `s` | `strchr("cat", 'a')` points to `"at"` |
| `strrchr(s, c)` | finds the last character `c` in `s` | `strrchr("aba", 'a')` points to the last `"a"` |
| `strstr(s, sub)` | finds the first copy of `sub` in `s` | `strstr("hello", "ll")` points to `"llo"` |
| `strtok(s, delim)` | splits `s` into pieces | see below |

Three things to know about this table:

- **The destination must be big enough.** `strcpy` and `strcat` never check the size of `dest`. If the result does not fit, they write past the end of the array, which is undefined behavior.
- **`strncpy` may leave out the `'\0'`.** If `src` has `n` or more characters, `strncpy` copies exactly `n` and does *not* add an end marker. So `strncpy(d, "hi!", 2)` gives you `h` and `i` with no `'\0'` after them, unless `d` already had one there. Add it yourself: `d[2] = '\0';`.
- **The "find" functions return a pointer**, not a position. `strchr("cat", 'a')` returns the address of the `a` inside `"cat"`, so printing it with `%s` shows `at`. If nothing is found, they return `NULL`.

## Comparing strings with strcmp

You cannot compare two strings with `==`. For arrays, `a == b` compares the **addresses** of the two arrays, not the letters in them, so two separate arrays holding `"cat"` are never `==`.

Use `strcmp(a, b)` instead. It compares the strings letter by letter, in dictionary order by character code, and returns:

- **0** if they are equal,
- a **negative** number if `a` comes first,
- a **positive** number if `b` comes first.

```c
char s[] = "aaa";
printf("%d\n", strcmp(s, "aaa"));    /* 0: equal */
printf("%d\n", strcmp(s, "aab"));    /* negative: 'a' comes before 'b' */
printf("%d\n", strcmp(s, "aaaaa"));  /* negative: "aaa" is a beginning of "aaaaa" */
printf("%d\n", strcmp("bbb", s));    /* positive */
```

On the course's Linux machines you will often see the actual difference of the two characters that differ, for example -1 for `'a' - 'b'`, or -97 for `"aaa"` against `"aaaaa"` (that is `'\0' - 'a'` = 0 - 97). But C only promises the **sign**. So always test `strcmp(a, b) == 0`, `< 0`, or `> 0`, never `== -1`.

### How strcmp works inside

Here is a version you could write yourself:

```c
int strcmp_impl(char str1[], char str2[]) {
    int i = 0;
    while (str1[i] && (str1[i] == str2[i])) {
        i++;
    }
    return str1[i] - str2[i];
}
```

- The loop walks both strings together, as long as `str1[i]` is not the end marker (`'\0'` counts as false) and the two characters are equal.
- It stops at the first difference, or when `str1` ends.
- The answer is the difference of the two characters at that spot. If both strings ended together, both are `'\0'`, and the difference is 0.

Notice it never needs `str2[i]` to be checked for `'\0'` separately: if `str2` ends first, `str2[i]` is 0, which differs from `str1[i]`, and the loop stops there.

:::trap
Comparing strings with `==`. `if (name == "Dana")` compares addresses and is false even when `name` holds "Dana". Write `if (strcmp(name, "Dana") == 0)`.
:::

## Splitting text with strtok

`strtok` ("string tokenizer") cuts a string into pieces, called **tokens**, wherever one of the **delimiter** characters you give it appears.

```c
#include <stdio.h>
#include <string.h>

void print_tokens(char str[], char delim[]) {
    char *token = strtok(str, delim);   /* first piece */
    while (token != NULL) {
        printf("%s\n", token);
        token = strtok(NULL, delim);    /* next piece of the same string */
    }
}

int main(void) {
    char str[] = "Hello, my website is: www.google.com";
    print_tokens(str, ",. :");
    return 0;
}
```

This prints each word on its own line: `Hello`, `my`, `website`, `is`, `www`, `google`, `com`.

How it works:

- The **first** call gets the string. It finds the first piece, and returns a pointer to it.
- Every **later** call gets `NULL` instead of the string. That means "continue in the same string where you stopped". `strtok` remembers the place itself.
- When there are no pieces left, it returns `NULL`, and the loop ends.
- Several delimiters in a row (like `", "` after `Hello`) count as one gap, so you never get empty pieces.

The delimiters decide what a piece is. With only `","`, the same string splits into just two pieces: `Hello` and ` my website is: www.google.com`. With only `"."` you get `Hello, my website is: www`, `google`, and `com`.

`strtok` **changes your string**: it writes a `'\0'` over each delimiter it uses, so each piece becomes its own small string. That is why `str` is an array, `char str[] = "...";`. A string written directly in the code, like `strtok("a,b", ",")`, may not be changed, and passing it to `strtok` crashes.

## Practice

:::problem id=prac-string-cells title="Cells in a string" source="ps1 (1).pdf" kind=exercise solution_origin=source
:::check id=prac-string-cells-q1
`char word[] = "code";` makes an array of {{=5|4|8}} cells.

Four letters plus the `'\0'` the compiler adds at the end.
:::

:::check id=prac-string-cells-q2
`strlen(word)` is {{=4|5|8}}.

`strlen` counts the characters before the `'\0'`.
:::
:::

:::problem id=prac-strcmp-sign title="Reading strcmp results" source="ps1 (1).pdf" kind=exercise solution_origin=source
:::check id=prac-strcmp-sign-q1
`strcmp("aab", "aaa")` is {{=positive|negative|0}}.

The first difference is at position 2: `'b'` against `'a'`. `'b'` is bigger, so the first string comes later.
:::

:::check id=prac-strcmp-sign-q2
`strcmp("aaa", "aaaaa")` is {{=negative|positive|0}}.

After three equal letters, the first string ends: `'\0'` (0) against `'a'` (97). The shorter one comes first.
:::

:::check id=prac-strcmp-sign-q3
Which test checks that `name` holds "Dana"?

- [x] `strcmp(name, "Dana") == 0`
- [ ] `name == "Dana"`
- [ ] `strcmp(name, "Dana") == 1`

`==` on strings compares addresses. `strcmp` returns 0 for equal strings, and only its sign matters otherwise.
:::
:::

:::problem id=prac-strtok-pieces title="Splitting with strtok" source="ps1 (1).pdf" kind=exercise solution_origin=source
`char str[] = "Hello, my website is: www.google.com";`

:::check id=prac-strtok-pieces-q1
With the delimiters `"."`, `strtok` gives {{=3|2|7}} pieces.

The two dots split the text into `Hello, my website is: www`, `google`, and `com`.
:::

:::check id=prac-strtok-pieces-q2
With the delimiters `" "` (a space only), the second piece is {{=my|Hello,|my website}}.

Only spaces cut, so the comma stays on `Hello,`, and the next piece is `my`.
:::

:::check id=prac-strtok-pieces-q3
Why do the later calls pass `NULL` instead of `str`?

- [x] `NULL` tells `strtok` to continue in the same string from where it stopped
- [ ] `str` was freed by the first call
- [ ] `NULL` makes `strtok` start again from the beginning

`strtok` remembers its place. Passing the string again would start over and return the first piece again.
:::
:::

**Next:** [Structures](topic:structures) groups values of different types, such as a name (a string) and an ID (a number), into a single record.
