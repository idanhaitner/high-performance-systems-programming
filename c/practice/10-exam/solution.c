// Practice 10: exam-style questions. Finished version, with comments.
// From the c folder:  make practice-solution LEVEL=10-exam

#include "../practice.h"

int count_set_bits(unsigned int x) {
    // Return how many bits of x are 1. count_set_bits(13) is 3,
    // because 13 is 1101 in binary.
    // Hint: x & 1 is the lowest bit, and x >> 1 drops it.
    int count = 0;
    while (x != 0) {
        count += x & 1u;
        x >>= 1;
    }
    return count;
}

bool is_power_of_two(unsigned int x) {
    // Return true when x is 1, 2, 4, 8, 16, ... and false otherwise
    // (0 is not). Bonus: do it with no loop.
    // A power of two has exactly one 1 bit. x - 1 turns that bit off and
    // every bit below it on, so x & (x - 1) is 0 only for powers of two.
    return x != 0 && (x & (x - 1)) == 0;
}

int binary_search(const int a[], int n, int target) {
    // a is sorted from small to large. Return a position of target, or -1
    // when it is not there. Look at the middle, then throw away the half
    // that cannot hold target. Do not just check every element.
    int lo = 0;
    int hi = n - 1;
    while (lo <= hi) {
        // lo + (hi - lo) / 2 is the middle, and cannot overflow the way
        // (lo + hi) / 2 can for huge arrays.
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) {
            return mid;
        } else if (a[mid] < target) {
            lo = mid + 1;  // target can only be in the right half
        } else {
            hi = mid - 1;  // target can only be in the left half
        }
    }
    return -1;
}

void bubble_sort(int a[], int n) {
    // Sort a from small to large. Go over the array again and again,
    // swapping neighbors that are in the wrong order, until a pass makes
    // no swaps.
    bool swapped = true;
    // After each pass, the largest remaining value has bubbled to the end,
    // so the next pass can stop one place earlier.
    for (int end = n - 1; end > 0 && swapped; end--) {
        swapped = false;
        for (int i = 0; i < end; i++) {
            if (a[i] > a[i + 1]) {
                int temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
                swapped = true;
            }
        }
    }
}

int most_frequent(const int a[], int n) {
    // n is at least 1. Return the value that appears most often. If there
    // is a tie, return the smallest of the tied values.
    // For every value, count how often it appears. This is n * n steps,
    // which is fine for an exam answer.
    int best = a[0];
    int best_count = 0;
    for (int i = 0; i < n; i++) {
        int count = 0;
        for (int j = 0; j < n; j++) {
            if (a[j] == a[i]) {
                count++;
            }
        }
        if (count > best_count || (count == best_count && a[i] < best)) {
            best = a[i];
            best_count = count;
        }
    }
    return best;
}

void transpose(int m[3][3]) {
    // Swap the rows and columns of a 3 x 3 grid, in place:
    //   1 2 3        1 4 7
    //   4 5 6  --->  2 5 8
    //   7 8 9        3 6 9
    // Swap each cell above the diagonal with its mirror below it. Looping
    // over every cell would swap each pair twice and undo the work.
    for (int r = 0; r < 3; r++) {
        for (int c = r + 1; c < 3; c++) {
            int temp = m[r][c];
            m[r][c] = m[c][r];
            m[c][r] = temp;
        }
    }
}

int diagonal_sum(int m[3][3]) {
    // Return the sum of both diagonals of a 3 x 3 grid. Count the middle
    // cell only once. For the grid above: 1 + 5 + 9 + 3 + 7 = 25.
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += m[i][i];       // top-left to bottom-right
        total += m[i][2 - i];   // top-right to bottom-left
    }
    // The middle cell m[1][1] is on both diagonals, so it was added twice.
    return total - m[1][1];
}

void run_length(const char* s, char* out) {
    // Compress runs of the same letter: "aaabccdddd" becomes "a3b1c2d4".
    // Each run is at most 9 long. out has enough room.
    int k = 0;
    int i = 0;
    while (s[i] != '\0') {
        // Count how long the run starting at i is.
        int run = 1;
        while (s[i + run] == s[i]) {
            run++;
        }
        out[k++] = s[i];
        out[k++] = (char)('0' + run);
        i += run;
    }
    out[k] = '\0';
}

bool are_anagrams(const char* a, const char* b) {
    // a and b contain only small letters. Return true when one is the
    // other with the letters shuffled: "listen" and "silent" are.
    // Hint: count each letter in a, uncount it in b.
    // counts[0] is for 'a', counts[25] for 'z'.
    int counts[26] = {0};
    for (int i = 0; a[i] != '\0'; i++) {
        counts[a[i] - 'a']++;
    }
    for (int i = 0; b[i] != '\0'; i++) {
        counts[b[i] - 'a']--;
    }
    // Anagrams use each letter equally often, so every count is back at 0.
    for (int i = 0; i < 26; i++) {
        if (counts[i] != 0) {
            return false;
        }
    }
    return true;
}

/* A linked list: each Node holds a value and the address of the next
   node. The last node's next is NULL. An empty list is a NULL head. */
typedef struct Node {
    int value;
    struct Node* next;
} Node;

bool push_front(Node** head, int value) {
    // Put a new node holding value at the front of the list.
    // head is the address of the caller's head pointer, so you can
    // change it. Return false when malloc fails.
    Node* node = malloc(sizeof *node);
    if (node == NULL) {
        return false;
    }
    node->value = value;
    node->next = *head;  // the old first node comes after the new one
    *head = node;        // the new node is now the first
    return true;
}

int list_length(const Node* head) {
    // Return how many nodes the list has.
    int count = 0;
    for (const Node* p = head; p != NULL; p = p->next) {
        count++;
    }
    return count;
}

int list_sum(const Node* head) {
    // Return the sum of all values.
    int total = 0;
    for (const Node* p = head; p != NULL; p = p->next) {
        total += p->value;
    }
    return total;
}

Node* list_reverse(Node* head) {
    // Reverse the list by turning every next pointer around. Make no new
    // nodes. Return the new head. A very common exam question.
    // previous is the part already reversed. Move one node at a time from
    // the front of the rest onto the front of previous.
    Node* previous = NULL;
    while (head != NULL) {
        Node* rest = head->next;  // save it before we overwrite next
        head->next = previous;
        previous = head;
        head = rest;
    }
    return previous;
}

void list_free(Node* head) {
    // Free every node.
    while (head != NULL) {
        // Read next before free: after free, the node may not be read.
        Node* next = head->next;
        free(head);
        head = next;
    }
}

static void test_bits(void) {
    expect_int(count_set_bits(13), 3);
    expect_int(count_set_bits(0), 0);
    expect_int(count_set_bits(255), 8);
}

static void test_power_of_two(void) {
    expect_true(is_power_of_two(1), "1 is a power of two");
    expect_true(is_power_of_two(64), "64 is a power of two");
    expect_true(!is_power_of_two(0), "0 is not a power of two");
    expect_true(!is_power_of_two(12), "12 is not a power of two");
}

static void test_binary_search(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38};
    expect_int(binary_search(a, 7, 2), 0);
    expect_int(binary_search(a, 7, 23), 5);
    expect_int(binary_search(a, 7, 38), 6);
    expect_int(binary_search(a, 7, 7), -1);
    expect_int(binary_search(a, 0, 2), -1);
}

static void test_bubble(void) {
    int a[] = {5, 1, 4, 2, 8, 0};
    int want[] = {0, 1, 2, 4, 5, 8};
    bubble_sort(a, 6);
    for (int i = 0; i < 6; i++) {
        expect_int(a[i], want[i]);
    }
}

static void test_frequent(void) {
    int a[] = {3, 1, 3, 2, 1, 3};
    int tie[] = {4, 2, 4, 2};
    expect_int(most_frequent(a, 6), 3);
    expect_int(most_frequent(tie, 4), 2);
}

static void test_transpose(void) {
    int m[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    transpose(m);
    expect_int(m[0][1], 4);
    expect_int(m[1][0], 2);
    expect_int(m[2][0], 3);
    expect_int(m[1][1], 5);
}

static void test_diagonal(void) {
    int m[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    expect_int(diagonal_sum(m), 25);
}

static void test_run_length(void) {
    char out[32];
    run_length("aaabccdddd", out);
    expect_str(out, "a3b1c2d4");
    run_length("", out);
    expect_str(out, "");
}

static void test_anagrams(void) {
    expect_true(are_anagrams("listen", "silent"), "listen / silent");
    expect_true(!are_anagrams("hello", "world"), "hello / world");
    expect_true(!are_anagrams("aab", "abb"), "aab / abb");
    expect_true(!are_anagrams("ab", "abc"), "ab / abc");
}

static void test_list(void) {
    Node* head = NULL;
    expect_int(list_length(head), 0);
    for (int i = 1; i <= 4; i++) {
        expect_true(push_front(&head, i), "push_front returned false");
    }
    // The list is now 4 -> 3 -> 2 -> 1.
    expect_int(head->value, 4);
    expect_int(list_length(head), 4);
    expect_int(list_sum(head), 10);
    list_free(head);
}

static void test_reverse(void) {
    Node* head = NULL;
    for (int i = 1; i <= 3; i++) {
        push_front(&head, i);
    }
    // 3 -> 2 -> 1 becomes 1 -> 2 -> 3.
    head = list_reverse(head);
    expect_int(head->value, 1);
    expect_int(head->next->value, 2);
    expect_int(head->next->next->value, 3);
    expect_ptr(head->next->next->next, NULL);
    list_free(head);
}

int main(void) {
    Score score = {0};
    task(&score, "count_set_bits", test_bits);
    task(&score, "is_power_of_two", test_power_of_two);
    task(&score, "binary_search", test_binary_search);
    task(&score, "bubble_sort", test_bubble);
    task(&score, "most_frequent", test_frequent);
    task(&score, "transpose", test_transpose);
    task(&score, "diagonal_sum", test_diagonal);
    task(&score, "run_length", test_run_length);
    task(&score, "are_anagrams", test_anagrams);
    task(&score, "push_front, list_length, list_sum, list_free", test_list);
    task(&score, "list_reverse", test_reverse);
    return score_finish(&score);
}
