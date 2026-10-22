# 09 — The build

A C program that has outgrown one file is compiled in pieces, then linked. A header declares names. A `.c` file defines them. The linker matches each use to one definition.

## One translation unit

Until this lesson every program was one `.c` file. The compiler reads that file, including the headers it pastes in, and writes one object file. That file is one translation unit.

`make run LESSON=09-build` still compiles one file, `demo.c`. The two-file program lives in `09-build/split/`. `make demos` builds it as well.

## A header and a definition

`09-build/split/mathx.h`:

```c
#ifndef MATHX_H
#define MATHX_H

int add(int a, int b);
int sub(int a, int b);

#endif
```

`#ifndef` / `#define` / `#endif` is an include guard. If the header is pasted twice into one translation unit, the second paste is skipped. Without the guard, two copies of the same declaration can be an error once a declaration stops being a plain function line.

The declarations have no bodies. They tell the caller the name, the parameter types, and the return type.

`09-build/split/mathx.c` includes the header and defines the functions. `main.c` includes the header and calls them. Neither file pastes the other's body.

Compile both, and link them, from this directory:

```bash
cc -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -I include -o build/09-build-split 09-build/split/main.c 09-build/split/mathx.c
```

## A missing definition

A declaration lets the compiler accept a call. The definition has to exist at link time. This `main` calls `missing`, and no file defines it. The compiler writes an object file. The linker then stops. This is the message on this machine:

```text
Undefined symbols for architecture arm64:
  "_missing", referenced from:
      _main in missing-main.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

The leading `_` is how this machine spells a C name to the linker. The name you wrote is `missing`. Two definitions of the same function is also a linker error. One declaration, one definition.

## What the demo prints

```text
One file is one translation unit.
A header declares. A .c file defines.
The linker joins the definitions the compiler left as names.
```

## What the two-file program prints

```text
add(2, 3) = 5
sub(10, 4) = 6
```

## Exercise

Open `exercise.c`. The functions are the kind of definitions that would live in a `.c` file, under declarations in a header. Each one still calls `not_implemented`. Then:

```bash
make try LESSON=09-build
```

A `[todo]` line is still the original call. A `[fail]` line ran and returned something else. The finished file is `solution.c`.

Next: [structs](../10-structs/lesson.md).
