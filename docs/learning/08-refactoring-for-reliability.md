# Learning Module 08: Refactoring for Reliability

## 1. The Danger of "Code Duplication" (DRY Principle)
In software engineering, there is a core principle called **DRY: Don't Repeat Yourself**. 

When we implemented Redis Caching in Phase 2, we added a line to clear the cache: `await req.redis.del(...)`. Because the "Complete Customer" logic was in two different files, we only added that line to one of them. This meant the app became "inconsistent"—sometimes the cache cleared, and sometimes it didn't.

## 2. Security via Centralization
By deleting the "easy" routes in `customer.routes.js`, we forced the application to use the secure routes in `queue.routes.js`. 

**The Lesson:** Security should not be optional. If you have a secure way to do something and an insecure way, **delete the insecure way** immediately. Do not leave it "just in case."

## 3. Benefits of a "Single Source of Truth"
1. **Maintainability:** If we change how a customer is "Completed" (e.g., adding a reward point), we only have to change the code in one place.
2. **Consistency:** All analytics, logs, and caches will always be perfectly in sync because there is only one path the data can take.
3. **Clarity:** New developers won't be confused by having two identical-looking APIs.
