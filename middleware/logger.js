// a “logger” middleware that outputs all requests to the server console;
export default function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
}
