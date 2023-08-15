const { ConnectionModel } = require('Model/database');

exports.process = async ({ connection_id }) => {
  await ConnectionModel.create({ id: connection_id })
};
