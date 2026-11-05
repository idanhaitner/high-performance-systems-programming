# make run    builds matmul.c with -O2 and times the matrix multiplication (make run N=1024 uses bigger matrices).
# make test   builds small matrices and checks that both loop orders give the same answer.
# make final  builds the layout toolkit in final/ and checks it.
# SRC_DIR is the folder that holds the code (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
N ?= 512
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -O2 -g
FINAL_DIR = $(SRC_DIR)/final
FINAL_CFLAGS = -std=c17 -Wall -Wextra -Wno-unused-parameter -O0 -g -Werror=implicit-function-declaration
FINAL_FILES = $(FINAL_DIR)/blocks.c $(FINAL_DIR)/blocks.h

.PHONY: run test final clean

run: matmul
	./matmul

test: matmul_test
	./matmul_test

final: final_test
	./final_test

matmul: $(SRC_DIR)/matmul.c
	$(CC) $(CFLAGS) -DN=$(N) $(SRC_DIR)/matmul.c -o matmul

matmul_test: $(SRC_DIR)/matmul.c
	$(CC) $(CFLAGS) -DN=64 $(SRC_DIR)/matmul.c -o matmul_test

final_test: tests/final_test.c $(FINAL_FILES)
	$(CC) $(FINAL_CFLAGS) -I$(FINAL_DIR) tests/final_test.c $(FINAL_DIR)/blocks.c -o final_test

clean:
	rm -rf matmul matmul_test final_test *.dSYM
