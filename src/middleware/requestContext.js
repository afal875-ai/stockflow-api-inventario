const { randomUUID } = require("node:crypto");

function requestContext(request, response, next) {
  request.id = request.get("X-Request-Id") || randomUUID();
  response.set({
    "X-Request-Id": request.id,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer"
  });
  next();
}

module.exports = requestContext;
