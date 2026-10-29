---
id: lecture-2
lecture: lecture-2
title: "Lecture 2 practice: memory management"
---

:::learn title="How this practice works"
You do this practice after you read the six lessons of Lecture 2. It does not teach new ideas. It walks through the lecture again, one small step at a time, so you can see what stuck and use it in real code. If you did the Lecture 1 practice, everything works the same way.

The steps follow the lessons in order. For each lesson you get a few kinds of steps:

- A **recap** is a short part copied from the lesson, to bring the idea back. Under each recap there is a link to the full lesson. If a recap feels new, open the lesson and read it before you go on.
- A **quick question** checks that you understood the idea.
- A **coding exercise** asks you to write a little C code right here on the page.
- The **lab** is one step you do on your own computer, in VS Code, a free code editor.

**Moving through the steps.** Press **Next** to go on. Next unlocks when a step is done: a recap is done as soon as you see it, a question when you answer it correctly, and a coding exercise when every test passes. If you are stuck, press **Skip for now**. The step is marked as skipped, and you can come back to it later with **Back**.

**Coding exercises.** Each exercise gives you starter code in an editor. Comments marked `TODO` ("to do") show the part left for you. You change the code, then press one of these buttons:

- **Run** builds your code and shows what it printed, or the compiler's error messages if it could not be built.
- **Test** builds your code and checks it against a few small test cases. Each case shows whether it passed. A failed case also shows what was expected and, often, a hint for that case.
- **Assembly** shows the machine instructions the compiler made from your C code. You do not need it to finish the exercises.

Your code is built by godbolt.org, a free website that runs the C compiler. So your code is sent there when you press one of these buttons. The build also adds a memory checker. In this lecture that helps a lot: if your code writes past the end of a block from `malloc`, or frees something twice, the checker stops the program and says so, instead of letting it quietly go wrong.

**Hints.** Under each exercise, **Show a hint** opens one hint at a time. The first is gentle, and each one after it is more specific. Try the first hint before the next.

**The solution.** After two Test runs that do not pass, a **Show solution** button appears. Look at it once you have really tried, and then write the code yourself.

**The lab.** The lab step has a zip file to download. You open it in VS Code, run it, and tick the box when you are done.
:::

:::learn from="pointers-to-pointers#a-pointer-to-a-pointer"
:::

:::learn from="pointers-to-pointers#changing-the-middle-pointer"
:::

:::check ref=chk-star-two-jobs
:::

:::check ref=prac-double-deref-q2
:::

:::exercise ref=ex-point-to-max
:::

:::learn from="pointer-arithmetic#four-ways-to-name-the-same-element"
:::

:::learn from="pointer-arithmetic#subtracting-two-pointers"
:::

:::learn from="pointer-arithmetic#mistakes-the-compiler-does-not-catch"
:::

:::check ref=prac-count-between-q1
:::

:::check ref=chk-sizeof-pointer
:::

:::check ref=prac-which-crash-q1
:::

:::exercise ref=ex-find-first
:::

:::learn from="function-pointers#making-and-using-a-function-pointer"
:::

:::learn from="function-pointers#passing-a-function-to-a-function"
:::

:::check ref=prac-read-declaration-q2
:::

:::check ref=prac-apply-output-q1
:::

:::exercise ref=ex-count-if
:::

:::learn from="malloc-and-free#asking-for-memory-with-malloc"
:::

:::learn from="malloc-and-free#giving-memory-back-with-free"
:::

:::learn from="malloc-and-free#three-ways-free-goes-wrong"
:::

:::check ref=prac-malloc-bytes-q1
:::

:::check ref=prac-free-errors-q2
:::

:::exercise ref=ex-reverse-copy
:::

:::learn from="realloc-and-strings#growing-a-block-with-realloc"
:::

:::learn from="realloc-and-strings#three-string-tools"
:::

:::learn from="realloc-and-strings#freeing-everything-in-the-right-order"
:::

:::check ref=prac-strlen-plus-one-q2
:::

:::check ref=prac-free-order-q2
:::

:::exercise ref=ex-copy-text
:::

:::check ref=prac-realloc-pattern-q2
:::

:::exercise ref=ex-append
:::

:::learn from="stack-or-heap#reason-1-for-the-heap-big-arrays"
:::

:::learn from="stack-or-heap#reason-2-for-the-heap-memory-that-outlives-the-function"
:::

:::learn from="stack-or-heap#why-the-stack-is-still-a-good-choice"
:::

:::check ref=prac-dangling-return-q1
:::

:::check ref=prac-stack-or-heap-q2
:::

:::lab ref=lab-stack-limit
:::
