int main(void) {
    size_t a = cache_offset(4816), b = cache_offset(3199);
    CHECK("offset", a == 16 && b == 63, "cache_offset(4816) should be 16 and cache_offset(3199) should be 63, but you returned %zu and %zu", a, b);

    a = cache_set(4816);
    b = cache_set(3199);
    CHECK("set", a == 11 && b == 1, "cache_set(4816) should be 11 and cache_set(3199) should be 1, but you returned %zu and %zu", a, b);

    a = cache_tag(4816);
    b = cache_tag(3199);
    CHECK("tag", a == 4 && b == 3, "cache_tag(4816) should be 4 and cache_tag(3199) should be 3, but you returned %zu and %zu", a, b);

    CHECK("same set", cache_set(0) == cache_set(1024) && cache_tag(0) != cache_tag(1024), "the addresses 0 and 1024 should be in the same set, but with different tags");
    return 0;
}
