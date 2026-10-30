# make run    builds stride.c with -O2 and runs the timing.
# make test   builds a small grid and checks that both sums are right.
# make final  builds the score report in final/ and checks it.
# SRC_DIR is the folder that holds the code (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -O2 -g
FINAL_DIR = $(SRC_DIR)/final
FINAL_CFLAGS = -std=c17 -Wall -Wextra -O0 -g -Werror=implicit-function-declaration
FINAL_FILES = $(FINAL_DIR)/players.c $(FINAL_DIR)/players.h

.PHONY: run test final clean

run: stride
	./stride

test: stride_test
	./stride_test

final: report final_test
	./final_test

stride: $(SRC_DIR)/stride.c
	$(CC) $(CFLAGS) $(SRC_DIR)/stride.c -o stride

stride_test: $(SRC_DIR)/stride.c
	$(CC) $(CFLAGS) -DN=1024 $(SRC_DIR)/stride.c -o stride_test

report: $(FINAL_DIR)/main.c $(FINAL_FILES)
	$(CC) $(FINAL_CFLAGS) $(FINAL_DIR)/main.c $(FINAL_DIR)/players.c -o report

final_test: tests/final_test.c $(FINAL_FILES)
	$(CC) $(FINAL_CFLAGS) -I$(FINAL_DIR) tests/final_test.c $(FINAL_DIR)/players.c -o final_test

clean:
	rm -rf stride stride_test report final_test *.dSYM
