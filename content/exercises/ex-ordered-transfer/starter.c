#include <pthread.h>

typedef struct {
    int id;
    long balance;
    pthread_mutex_t lock;
} Account;

void transfer(Account *from, Account *to, long amount) {
}
