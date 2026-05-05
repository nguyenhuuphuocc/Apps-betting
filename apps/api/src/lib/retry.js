export async function withRetry(task, { attempts = 3, baseDelayMs = 350 } = {}) {
  let lastError = null;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const waitMs = baseDelayMs * 2 ** index;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastError;
}
