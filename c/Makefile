# Build the lessons from this directory:
#   make run LESSON=01-program     build and run the demo
#   make try LESSON=01-program     build and run your exercise
#   make leaks LESSON=08-memory    run your exercise and report memory leaks
#   make split                     build and run lesson 09's two-file program
#   make link-error                show lesson 09's linker error on purpose
#   make practice LEVEL=01-printing           build and run a practice exercise
#   make practice-solution LEVEL=01-printing  run that practice set's solution
#   make practice-leaks LEVEL=08-memory       practice exercise with a leak check
#   make test-practice                        run every practice solution
#   make test                      run every finished solution
#   make test-asan                 run every solution with the address sanitizer
#   make test-leaks                check every solution for memory leaks
#   make clean                     delete everything that was built

CC      ?= cc
CFLAGS  ?= -std=c11 -Wall -Wextra -Wpedantic -Wno-unused-parameter -g -I include
BUILD   := build
CHECK_H := include/check.h

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

# Practice sets, easiest first. See practice/README.md.
LEVELS := \
	01-printing \
	02-arithmetic \
	03-conditions \
	04-loops \
	05-arrays \
	06-strings \
	07-pointers \
	08-memory \
	09-structs \
	10-exam

DEMOS     := $(addprefix $(BUILD)/, $(addsuffix -demo, $(LESSONS)))
EXERCISES := $(addprefix $(BUILD)/, $(addsuffix -exercise, $(LESSONS)))
SOLUTIONS := $(addprefix $(BUILD)/, $(addsuffix -solution, $(LESSONS)))

# On macOS the address sanitizer cannot find leaks, so the leak check uses
# the system's `leaks` tool. On Linux the address sanitizer finds leaks itself.
ifeq ($(shell uname -s),Darwin)
LEAK_CHECK := leaks --quiet --atExit --
endif

.PHONY: all demos exercises test test-asan test-leaks run try leaks split link-error practice practice-solution practice-leaks test-practice clean need-lesson need-level

all: demos exercises

demos: $(DEMOS) $(BUILD)/09-build-split

$(BUILD)/09-build-split: 09-build/split/main.c 09-build/split/mathx.c 09-build/split/mathx.h | $(BUILD)
	$(CC) $(CFLAGS) -o $@ 09-build/split/main.c 09-build/split/mathx.c

exercises: $(EXERCISES)

split: $(BUILD)/09-build-split
	./$(BUILD)/09-build-split

# This build fails on purpose. The leading - lets make carry on after it.
link-error: | $(BUILD)
	-$(CC) $(CFLAGS) -o $(BUILD)/09-build-missing 09-build/missing/main.c

test: $(SOLUTIONS)
	@fail=0; \
	for n in $(LESSONS); do \
		echo; echo "== $$n"; \
		./$(BUILD)/$$n-solution || fail=1; \
	done; \
	exit $$fail

# The sanitizer build goes in its own directory, so it never mixes with the
# ordinary build.
test-asan:
	$(MAKE) test BUILD=build/asan CFLAGS="$(CFLAGS) -fsanitize=address"

ifdef LEAK_CHECK
test-leaks: $(SOLUTIONS)
	@fail=0; \
	for n in $(LESSONS); do \
		out=$$($(LEAK_CHECK) ./$(BUILD)/$$n-solution 2>&1); status=$$?; \
		echo "$$n: $$(echo "$$out" | grep -E 'leaks? for' | sed 's/^Process [0-9]*: //')"; \
		[ $$status -eq 0 ] || fail=1; \
	done; \
	exit $$fail

leaks: need-lesson $(BUILD)/$(LESSON)-exercise
	$(LEAK_CHECK) ./$(BUILD)/$(LESSON)-exercise
else
test-leaks: test-asan

leaks: need-lesson
	$(MAKE) try BUILD=build/asan CFLAGS="$(CFLAGS) -fsanitize=address"
endif

run: need-lesson $(BUILD)/$(LESSON)-demo
	./$(BUILD)/$(LESSON)-demo

try: need-lesson $(BUILD)/$(LESSON)-exercise
	./$(BUILD)/$(LESSON)-exercise

need-lesson:
	@if [ -z "$(LESSON)" ] || [ ! -d "$(LESSON)" ]; then \
		echo "Name a lesson, for example:  make $(MAKECMDGOALS) LESSON=01-program"; \
		echo "Lessons: $(LESSONS)"; \
		exit 1; \
	fi

# The practice sets live in practice/<level>/ and share practice/practice.h.
practice: need-level $(BUILD)/practice-$(LEVEL)-exercise
	./$(BUILD)/practice-$(LEVEL)-exercise

practice-solution: need-level $(BUILD)/practice-$(LEVEL)-solution
	./$(BUILD)/practice-$(LEVEL)-solution

ifdef LEAK_CHECK
practice-leaks: need-level $(BUILD)/practice-$(LEVEL)-exercise
	$(LEAK_CHECK) ./$(BUILD)/practice-$(LEVEL)-exercise
else
practice-leaks: need-level
	$(MAKE) practice BUILD=build/asan CFLAGS="$(CFLAGS) -fsanitize=address"
endif

test-practice: $(addprefix $(BUILD)/practice-, $(addsuffix -solution, $(LEVELS)))
	@fail=0; \
	for n in $(LEVELS); do \
		echo; echo "== practice $$n"; \
		./$(BUILD)/practice-$$n-solution || fail=1; \
	done; \
	exit $$fail

need-level:
	@if [ -z "$(LEVEL)" ] || [ ! -d "practice/$(LEVEL)" ]; then \
		echo "Name a practice set, for example:  make $(MAKECMDGOALS) LEVEL=01-printing"; \
		echo "Practice sets: $(LEVELS)"; \
		exit 1; \
	fi

clean:
	rm -rf build

$(BUILD):
	mkdir -p $(BUILD)

# Every program includes check.h or nothing, so a change to check.h rebuilds
# them all.
$(BUILD)/%-demo: %/demo.c | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<

$(BUILD)/%-exercise: %/exercise.c $(CHECK_H) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<

$(BUILD)/%-solution: %/solution.c $(CHECK_H) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $<

# -lm links the math library, for sqrt in practice 09. Linux needs it; macOS
# links it anyway.
$(BUILD)/practice-%-exercise: practice/%/exercise.c practice/practice.h $(CHECK_H) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $< -lm

$(BUILD)/practice-%-solution: practice/%/solution.c practice/practice.h $(CHECK_H) | $(BUILD)
	$(CC) $(CFLAGS) -o $@ $< -lm
