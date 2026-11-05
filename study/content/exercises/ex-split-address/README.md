---
title: Split an address
---

A cache with 64-byte lines and 16 sets reads an address as three parts: the offset inside the line, the set, and the tag.

Write three functions:

- `cache_offset(addr)` returns the address's position inside its line.
- `cache_set(addr)` returns the number of the set, from 0 to 15.
- `cache_tag(addr)` returns the tag.

You are done when Submit shows all four cases passing.

:::example
**Input:** `cache_offset(4816)`, `cache_set(4816)`, and `cache_tag(4816)`, where 4816 is `0x12D0`

**Output:** 16, 11, and 4
:::

:::hint
The offset is the remainder after dividing by 64. The line number is the address divided by 64, ignoring the remainder.
:::

:::hint
The set is the line number modulo 16. The tag is the line number divided by 16, ignoring the remainder.
:::

:::hint
`cache_offset` returns `addr % 64`, `cache_set` returns `(addr / 64) % 16`, and `cache_tag` returns `addr / (64 * 16)`.
:::

:::case name="offset"
The offset is `addr % 64`.
:::

:::case name="set"
Divide by 64 first to get the line number, and only then take the remainder by 16.
:::

:::case name="tag"
The tag counts how many whole turns of 16 lines of 64 bytes, 1024 bytes, come before the address.
:::

:::case name="same set"
The addresses 0 and 1024 are in the same set, but their tags are different.
:::
