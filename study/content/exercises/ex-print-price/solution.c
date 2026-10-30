#include <stdio.h>

int main(void) {
    int items;
    double price;
    scanf("%d %lf", &items, &price);
    printf("%d items cost %.2f each\n", items, price);
    return 0;
}
