#include <pthread.h>

typedef struct {
    int id;
    long balance;
    pthread_mutex_t lock;
} Account;

void transfer(Account *from, Account *to, long amount) {
    Account *first = from->id < to->id ? from : to;
    Account *second = from->id < to->id ? to : from;

    pthread_mutex_lock(&first->lock);
    pthread_mutex_lock(&second->lock);
    from->balance -= amount;
    to->balance += amount;
    pthread_mutex_unlock(&second->lock);
    pthread_mutex_unlock(&first->lock);
}
