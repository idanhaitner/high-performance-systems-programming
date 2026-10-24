# 09 — The build

Every program so far was one `.c` file. Real programs have hundreds of files. This lesson shows how C splits a program across files, what the compiler and the **linker** each do, and how to read the error you get when a function is declared but never written.

## Two steps: compile, then link

Lesson 01 said the compiler turns a `.c` file into a program. That is really two steps, which `cc` runs one after the other:

1. **Compile.** The compiler reads one `.c` file, together with every header it includes, and turns it into machine code. It writes an **object file** (ending in `.o`). One `.c` file plus its headers is called a **translation unit**. The compiler sees only one translation unit at a time.
2. **Link.** The **linker** joins all the object files into one executable. When `main.c` calls `add`, but `add` is written in `mathx.c`, the linker is what connects the call to the function.

## Declare in a header, define in a `.c` file

Lesson 05 separated two ideas:

- A **declaration** says that a function exists: its name, parameter types, and return type. It has no body.
- A **definition** is the function with its body.

The compiler needs a declaration before every call. A **header** file, ending in `.h`, holds the declarations that other files need. The example is in `09-build/split/`.

`mathx.h`:

```c
#ifndef MATHX_H
#define MATHX_H

int add(int a, int b);
int sub(int a, int b);

#endif
```

`mathx.c` includes the header and defines both functions:

```c
#include "mathx.h"

int add(int a, int b) {
    return a + b;
}

int sub(int a, int b) {
    return a - b;
}
```

`main.c` includes the header and calls the functions:

```c
#include <stdio.h>

#include "mathx.h"

int main(void) {
    printf("add(2, 3) = %d\n", add(2, 3));
    printf("sub(10, 4) = %d\n", sub(10, 4));
    return 0;
}
```

`#include "mathx.h"` uses double quotes for your own headers. Angle brackets, as in `<stdio.h>`, are for headers that come with the system.

### The include guard

The three lines `#ifndef MATHX_H`, `#define MATHX_H`, and `#endif` are an **include guard**. `#include` pastes a file's text in, so in a big program the same header can be pasted twice into one translation unit by accident. The guard makes the second paste empty:

- `#ifndef MATHX_H` means "only keep the following text if the name `MATHX_H` is not defined yet".
- `#define MATHX_H` defines that name, so the next time, the check fails.
- `#endif` ends the guarded part.

Repeated function declarations are harmless, but repeated type definitions, such as the structs of lesson 10, are errors. So every header gets a guard.

## Build and run the two-file program

```bash
make split
```

That runs:

```bash
cc -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -g -I include -o build/09-build-split 09-build/split/main.c 09-build/split/mathx.c
./build/09-build-split
```

`cc` compiles `main.c` and `mathx.c` separately, then links the two object files into one program. It prints:

```text
add(2, 3) = 5
sub(10, 4) = 6
```

## A missing definition

A declaration is a promise that a definition exists somewhere. The compiler trusts it. Only the linker checks it. `09-build/missing/main.c` declares a function named `missing` and calls it, but no file defines it. Run:

```bash
make link-error
```

Compiling succeeds. Linking fails with this message on this machine:

```text
Undefined symbols for architecture arm64:
  "_missing", referenced from:
      _main in main-99d850.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

How to read it:

- `Undefined symbols` means the linker found a call to a name but no definition. A **symbol** is a name the linker works with.
- `"_missing"` is the name it could not find. On macOS, the linker puts `_` in front of every C name, so `_missing` is your `missing`.
- `referenced from: _main` says the call is in `main`.
- `main-99d850.o` is a temporary object file made from `main.c`. The numbers change on every run.
- `ld` is the linker's name.

On Linux the wording differs, for example `undefined reference to 'missing'`, but it means the same thing. The fix is to write the definition, or to add the `.c` file that holds it to the command.

The opposite mistake, defining the same function in two `.c` files, is also a link error: the linker finds two definitions and cannot choose. The rule is one declaration in a header, and exactly one definition in one `.c` file.

## What the demo prints

```text
One file is one translation unit.
A header declares. A .c file defines.
The linker joins the definitions the compiler left as names.
```

## Exercise

Open `exercise.c`. These functions are the kind of definitions that would live in a `.c` file, with their declarations in a header. Each unfinished one contains a `not_implemented(...)` line. Replace it with your code. Then:

```bash
make try LESSON=09-build
```

A `[todo]` line means the function still contains `not_implemented`. A `[fail]` line means it ran and returned the wrong value. The finished version is `solution.c`.

Next: [structs](../10-structs/lesson.md), where several values are grouped into one.
