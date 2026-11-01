#include <stdint.h>

int fits_in_byte(int value) {
    return (uint8_t)value == value;
}
