static Account acc_x = {1, 100000, PTHREAD_MUTEX_INITIALIZER};
static Account acc_y = {2, 100000, PTHREAD_MUTEX_INITIALIZER};

static void *x_to_y(void *arg) {
    for (int i = 0; i < 20000; i++) transfer(&acc_x, &acc_y, 3);
    return arg;
}

static void *y_to_x(void *arg) {
    for (int i = 0; i < 20000; i++) transfer(&acc_y, &acc_x, 2);
    return arg;
}

int main(void) {
    Account x = {1, 100, PTHREAD_MUTEX_INITIALIZER};
    Account y = {2, 50, PTHREAD_MUTEX_INITIALIZER};
    transfer(&x, &y, 30);
    CHECK("one transfer", x.balance == 70 && y.balance == 80, "after moving 30 from x (100) to y (50), x should be 70 and y 80, but they are %ld and %ld", x.balance, y.balance);

    transfer(&y, &x, 50);
    CHECK("the other direction", x.balance == 120 && y.balance == 30, "after moving 50 from y back to x, x should be 120 and y 30, but they are %ld and %ld", x.balance, y.balance);

    pthread_t a, b;
    pthread_create(&a, NULL, x_to_y, NULL);
    pthread_create(&b, NULL, y_to_x, NULL);
    pthread_join(a, NULL);
    pthread_join(b, NULL);
    CHECK("two threads at once", acc_x.balance == 80000 && acc_y.balance == 120000, "after 20000 transfers of 3 from x to y and 20000 of 2 back, x should be 80000 and y 120000, but they are %ld and %ld", acc_x.balance, acc_y.balance);
    return 0;
}
