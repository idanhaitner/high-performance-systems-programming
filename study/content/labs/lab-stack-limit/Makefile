# make test  builds a small array and checks that the heap version is right.
# make run   tries N ints (10 million = 40 MB by default), first on the heap, then on the stack.
#            make run N=50000000 tries 50 million ints (200 MB).
# SRC_DIR is the folder that holds bigarray.c (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
N ?= 10000000
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -O0 -g

.PHONY: run test clean

run: bigarray
	./bigarray $(N)

test: bigarray
	./bigarray 1000 --heap-only

bigarray: $(SRC_DIR)/bigarray.c
	$(CC) $(CFLAGS) $(SRC_DIR)/bigarray.c -o bigarray

clean:
	rm -f bigarray
