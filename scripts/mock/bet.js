let betTotal = 0;

module.exports = (cmd, params) => {
  betTotal += params.multiple;
  const data = {
    ...params,
    bet: params.multiple * 0.2,
    uid: '0F6557B876684975A8948C70678897DC',
    betTotal,
  };
  return { cmd, code: 200, msg: 'success', data };
};
