# Build the lessons from this directory:
#   make run LESSON=01-program
#   make try LESSON=01-program
#   make test

CC      ?= cc
CFLAGS  ?= -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -I include
BUILD   := build

# Syllabus order. One directory name per lesson.
LESSONS := \
	01-program \
	02-types \
	03-expressions \
	04-control-flow \
	05-functions \
	06-arrays-and-strings \
	07-pointers \
	08-memory \
	09-build \
	10-structs \
	11-ownership \
	12-capstone

DEMOS     := $(addprefix $(BUILD)/, $(addsuffix -demo, $(LESSONS)))
EXERCISES := $(addprefix $(BUILD)/, $(addsuffix -exercise, $(LESSONS)))
SOLUTIONS := $(addprefix $(BUILD)/, $(addsuffix -solution, $(LESSONS)))

.PHONY: all demos exercises test test-asan run try clean

all: demos exercises

demos: $(DEMOS) $(BUILD)/09-build-split

$(BUILD)/09-build-split: 09-build/split/main.c 09-build/split/mathx.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ 09-build/split/main.c 09-build/split/mathx.c

exercises: $(EXERCISES)

test: $(SOLUTIONS)
	@fail=0; \
	for n in $(LESSONS); do \
		echo; echo "== $$n"; \
		./$(BUILD)/$$n-solution || fail=1; \
	done; \
	exit $$fail

test-asan:
	$(MAKE) clean
	$(MAKE) test CFLAGS="$(CFLAGS) -fsanitize=address -g"

run: $(BUILD)/$(LESSON)-demo
	./$(BUILD)/$(LESSON)-demo

try: $(BUILD)/$(LESSON)-exercise
	./$(BUILD)/$(LESSON)-exercise

clean:
	rm -rf $(BUILD)

$(BUILD):
	mkdir -p $(BUILD)

$(BUILD)/%-demo: %/demo.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<

$(BUILD)/%-exercise: %/exercise.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<

$(BUILD)/%-solution: %/solution.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<
