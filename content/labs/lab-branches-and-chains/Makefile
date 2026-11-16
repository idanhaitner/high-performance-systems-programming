# make run    builds bench.c and times branches and running totals (make run OPT=-O0 uses another level).
# make test   builds small inputs and checks that sum_four gives the right answer.
# make final  builds the optimized functions in final/ and checks them.
# SRC_DIR is the folder that holds the code (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
OPT ?= -O2
CC = gcc
# The two -fno-...-vectorize options stop the compiler from using wide instructions
# that handle several numbers at once, so you see the effects of this lecture alone.
CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -g -fno-tree-vectorize -fno-tree-slp-vectorize
FINAL_DIR = $(SRC_DIR)/final
FINAL_CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -O0 -g -Werror=implicit-function-declaration
FINAL_FILES = $(FINAL_DIR)/fast.c $(FINAL_DIR)/fast.h

.PHONY: run test final clean

run: bench
	./bench

test: bench_test
	./bench_test

final: final_test
	./final_test

bench: $(SRC_DIR)/bench.c FORCE
	$(CC) $(CFLAGS) $(OPT) $(SRC_DIR)/bench.c -o bench

bench_test: $(SRC_DIR)/bench.c
	$(CC) $(CFLAGS) -O2 -DSMALL $(SRC_DIR)/bench.c -o bench_test

final_test: tests/final_test.c $(FINAL_FILES)
	$(CC) $(FINAL_CFLAGS) -I$(FINAL_DIR) tests/final_test.c $(FINAL_DIR)/fast.c -o final_test -lm

FORCE:

clean:
	rm -rf bench bench_test final_test *.dSYM
