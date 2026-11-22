---
id: lecture-5
lecture: lecture-5
title: "Lecture 5 practice: threads in C"
---

:::learn title="How this practice works"
This practice goes over the main ideas of the lecture: a few quick questions, a few coding exercises with real threads, and one lab at the end that you do on your own computer in VS Code, a free code editor.

In an exercise, the panel on the left says what the function must do, and you write it on the right. **Run** shows what your code prints, and **Submit** checks it against small tests. If you are stuck, open **Hints** one at a time, or use the **Reread** link to open the step's lesson.

The tests check that your answer is correct, not that it is fast. Timing threads needs your own computer, and that is what the lab is for.

Your code is built by godbolt.org, a free website that runs the C compiler, so your code is sent there when you press **Run** or **Submit**.
:::

:::check id=q-main-returns lesson=creating-threads
`main` creates a thread that prints a line, and then returns right away, without calling `pthread_join`. What happens to the thread?

- [ ] It keeps running until it has printed its line, and then the program ends
- [x] Returning from `main` ends the whole process, so the thread may be stopped before it prints anything
- [ ] The program waits for every thread automatically

Returning from `main` ends the process, and every thread in it stops at once. Joining the thread first guarantees that its work is done.
:::

:::check id=q-same-address lesson=thread-arguments
A loop runs `for (int i = 0; i < 4; i++) pthread_create(&t[i], NULL, worker, &i);`, and each worker prints the `int` its argument points to. Why can two workers print the same number?

- [x] Every worker gets the address of the same `i`, which the loop keeps changing
- [ ] Threads always get a copy of the value, but the copies can be mixed up
- [ ] Because the threads run on the same core

All four workers receive `&i`, one address. A worker that reads it late sees whatever value the loop has reached by then. Giving each thread its own array element fixes it.
:::

:::exercise ref=ex-thread-squares lesson=thread-arguments
:::

:::exercise ref=ex-parallel-sum lesson=splitting-work
:::

:::check id=q-two-increments lesson=race-conditions
A shared `int count` is 10. Two threads each run `count++` once, at the same time, with no lock. Which results are possible?

- [ ] Only 12
- [x] 11 or 12
- [ ] 10, 11, or 12

`count++` reads, adds 1, and writes. If both threads read 10 before either writes, both write 11, and one increment is lost. If one finishes before the other reads, the result is 12.
:::

:::check id=q-lock-placement lesson=mutexes-and-deadlock
Four threads each count the matches in their own part of an array, and the program needs one shared total. Where should the mutex go?

- [ ] Around every match, inside the loop
- [x] Around one line after the loop, that adds the thread's local count to the shared total
- [ ] Nowhere, because each thread has its own part

Counting in a local variable needs no lock, because nobody else uses it. Only the single update of the shared total needs one. With no lock at all, the updates of the total race.
:::

:::exercise ref=ex-private-histogram lesson=mutexes-and-deadlock
:::

:::exercise ref=ex-ordered-transfer lesson=mutexes-and-deadlock
:::

:::check id=q-fetch-add-ticket lesson=atomics-and-coordination
`atomic_int next = 0;` Three threads each run `int id = atomic_fetch_add(&next, 1);` once, at the same time. Which values of `id` can they get?

- [ ] All three can get 0
- [x] 0, 1, and 2, one each, in some order
- [ ] 1, 2, and 3

Each `atomic_fetch_add` is one indivisible step that returns the value before it added 1. So the three threads get 0, 1, and 2, never the same number twice, and `next` ends at 3.
:::

:::check id=q-speedup-numbers lesson=parallel-speedup
A job takes 30 seconds on one thread and 10 seconds on 6 threads. What are the speedup and the efficiency?

- [x] Speedup 3, efficiency 50%
- [ ] Speedup 6, efficiency 100%
- [ ] Speedup 3, efficiency 300%

Speedup is 30 / 10 = 3. Efficiency is the speedup divided by the number of threads, 3 / 6 = 50%.
:::

:::lab ref=lab-thread-speedup lesson=parallel-speedup
:::
