# make run    builds bench.c and times the threaded sum and three shared counters (make run OPT=-O0 uses another level).
# make test   builds small inputs and checks that parallel_sum gives the right answer.
# make tsan   builds with ThreadSanitizer, which reports two threads using the same memory without taking turns.
# make final  builds the threaded functions in final/ and checks them.
# SRC_DIR is the folder that holds the code (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
OPT ?= -O2
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -g -pthread
FINAL_DIR = $(SRC_DIR)/final
FINAL_CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -O0 -g -pthread -Werror=implicit-function-declaration
FINAL_FILES = $(FINAL_DIR)/par.c $(FINAL_DIR)/par.h

.PHONY: run test tsan final clean

run: bench
	./bench

test: bench_test
	./bench_test

tsan: bench_tsan
	./bench_tsan

final: final_test
	./final_test

bench: $(SRC_DIR)/bench.c FORCE
	$(CC) $(CFLAGS) $(OPT) $(SRC_DIR)/bench.c -o bench

bench_test: $(SRC_DIR)/bench.c
	$(CC) $(CFLAGS) -O2 -DSMALL $(SRC_DIR)/bench.c -o bench_test

bench_tsan: $(SRC_DIR)/bench.c
	$(CC) $(CFLAGS) -O1 -DSMALL -fsanitize=thread $(SRC_DIR)/bench.c -o bench_tsan

final_test: tests/final_test.c $(FINAL_FILES)
	$(CC) $(FINAL_CFLAGS) -I$(FINAL_DIR) tests/final_test.c $(FINAL_DIR)/par.c -o final_test

FORCE:

clean:
	rm -rf bench bench_test bench_tsan final_test *.dSYM
