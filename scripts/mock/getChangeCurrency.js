module.exports = (cmd, params) => {
  const data = {
    ...params,
  };
  return { cmd, code: 200, msg: 'success', data };
};
