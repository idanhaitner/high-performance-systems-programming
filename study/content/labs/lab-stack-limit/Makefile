# make test   builds a small array and checks that the heap version is right.
# make run    tries N ints (10 million = 40 MB by default), first on the heap, then on the stack.
#             make run N=50000000 tries 50 million ints (200 MB).
# make words  builds the word list program in final/.
# make final  builds the word list and checks it, including that it frees all its memory.
# SRC_DIR is the folder that holds the code (make test SRC_DIR=solution checks the answer).
SRC_DIR ?= .
N ?= 10000000
CC = gcc
CFLAGS = -std=c17 -Wall -Wextra -O0 -g
FINAL_DIR = $(SRC_DIR)/final
FINAL_FILES = $(FINAL_DIR)/wordlist.c $(FINAL_DIR)/wordlist.h
# These send every memory call of your code to tests/counting_alloc.c.
COUNTED = -Dmalloc=counted_malloc -Dcalloc=counted_calloc -Drealloc=counted_realloc -Dfree=counted_free -Dstrdup=counted_strdup

.PHONY: run test final clean

run: bigarray
	./bigarray $(N)

test: bigarray
	./bigarray 1000 --heap-only

final: words_checked final_test
	./final_test

bigarray: $(SRC_DIR)/bigarray.c
	$(CC) $(CFLAGS) $(SRC_DIR)/bigarray.c -o bigarray

words: $(FINAL_DIR)/main.c $(FINAL_FILES)
	$(CC) $(CFLAGS) $(FINAL_DIR)/main.c $(FINAL_DIR)/wordlist.c -o words

words_checked: $(FINAL_DIR)/main.c $(FINAL_FILES) tests/counting_alloc.c
	$(CC) $(CFLAGS) $(COUNTED) -c $(FINAL_DIR)/wordlist.c -o wordlist_checked.o
	$(CC) $(CFLAGS) $(COUNTED) -c $(FINAL_DIR)/main.c -o main_checked.o
	$(CC) $(CFLAGS) -DREPORT_AT_EXIT main_checked.o wordlist_checked.o tests/counting_alloc.c -o words_checked

final_test: tests/final_test.c $(FINAL_FILES) tests/counting_alloc.c
	$(CC) $(CFLAGS) $(COUNTED) -c $(FINAL_DIR)/wordlist.c -o wordlist_checked.o
	$(CC) $(CFLAGS) -I$(FINAL_DIR) wordlist_checked.o tests/final_test.c tests/counting_alloc.c -o final_test

clean:
	rm -rf bigarray words words_checked final_test *.o *.dSYM
