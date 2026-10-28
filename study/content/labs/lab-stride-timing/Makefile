# make run   builds stride.c with -O2 and runs the timing.
# make test  builds a small grid and checks that both sums are right.
# SRC_DIR is the folder that holds stride.c (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -O2 -g

.PHONY: run test clean

run: stride
	./stride

test: stride_test
	./stride_test

stride: $(SRC_DIR)/stride.c
	$(CC) $(CFLAGS) $(SRC_DIR)/stride.c -o stride

stride_test: $(SRC_DIR)/stride.c
	$(CC) $(CFLAGS) -DN=1024 $(SRC_DIR)/stride.c -o stride_test

clean:
	rm -f stride stride_test
