// Wraps an async Express handler so a rejected promise is forwarded to the
// error-handling middleware instead of crashing the Node process (which would
// surface to clients as a 502 Bad Gateway from the reverse proxy).
export function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}

// Recursively wraps every handler registered on an Express router (including
// mounted sub-routers) so all async rejections become JSON 500 responses.
export function failSafe(router) {
  function wrapStack(stack) {
    if (!Array.isArray(stack)) return;
    for (const layer of stack) {
      if (!layer) continue;

      if (layer.route && Array.isArray(layer.route.stack)) {
        for (const step of layer.route.stack) {
          if (step && typeof step.handle === "function") {
            step.handle = asyncHandler(step.handle);
          }
        }
      } else if (
        layer.handle &&
        typeof layer.handle === "function" &&
        Array.isArray(layer.handle.stack)
      ) {
        wrapStack(layer.handle.stack);
      }
    }
  }

  wrapStack(router.stack);
  return router;
}