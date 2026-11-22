---
title: Move money without a deadlock
---

Moving money between two accounts changes two balances that must change together, so a transfer locks both accounts' mutexes. If one thread locks account X and then Y while another locks Y and then X, each can end up waiting for the other forever. Taking the locks in one fixed order, the same in every thread, makes that impossible.

Write `transfer(from, to, amount)`. It takes `amount` away from `from->balance` and adds it to `to->balance`, while holding both accounts' locks. Always lock the account with the **smaller `id` first**, whichever way the money moves. Unlock both locks before returning. `from` and `to` are always different accounts.

The tests run two threads that send money back and forth between the same two accounts thousands of times. A version that locks `from` first can freeze, and then Run or Submit stops with a time limit.

You are done when Submit shows all three cases passing.

:::example
**Input:** `x` has id 1 and balance 100, `y` has id 2 and balance 50. Then `transfer(&x, &y, 30)`.

**Output:** `x.balance` is 70 and `y.balance` is 80
:::

:::example
**Input:** right after that, `transfer(&y, &x, 50)`

**Output:** `x.balance` is 120 and `y.balance` is 30. `x` is still locked first, because it has the smaller id, even though the money leaves `y`.
:::

:::hint
Pick the order first: `Account *first = from->id < to->id ? from : to;` and `Account *second = from->id < to->id ? to : from;`.
:::

:::hint
Then `pthread_mutex_lock(&first->lock);` and `pthread_mutex_lock(&second->lock);`, followed by the two balance changes.
:::

:::hint
Finish with `pthread_mutex_unlock(&second->lock);` and `pthread_mutex_unlock(&first->lock);`.
:::

:::case name="one transfer"
Money moves from the account with the smaller id to the other.
:::

:::case name="the other direction"
Money moves from the account with the larger id. The balances must still be right.
:::

:::case name="two threads at once"
Two threads send money in opposite directions thousands of times. No money may be lost, and the program must not freeze.
:::
