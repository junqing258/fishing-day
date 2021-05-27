exports.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.pipeAsyncFunctions = (...fns) => (arg) => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));

exports.runPromisesInSeries = (ps) => ps.reduce((p, next) => p.then(next), Promise.resolve());

exports.chainAsync = (fns) => {
  let curr = 0;
  const last = fns[fns.length - 1];
  const next = () => {
    const fn = fns[curr++];
    fn === last ? fn() : fn(next);
  };
  return next;
};

exports.promisify = (func) => (...args) =>
  new Promise((resolve, reject) => func(...args, (err, result) => (err ? reject(err) : resolve(result))));

exports.recursiveFiles = (dir, handler) => {
  return runPromisesInSeries(
    fs.readdirSync(dir).map((filename) => async () => {
      const fileDir = path.join(dir, filename);
      const stats = fs.statSync(fileDir);
      if (stats.isFile()) {
        await handler(fileDir);
      } else if (stats.isDirectory()) {
        await recursiveFiles(fileDir, handler);
      }
    }),
  );
};
