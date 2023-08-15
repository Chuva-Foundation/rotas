const { ConnectionModel } = require('Model/database');

exports.process = async ({ connection_id }) => {
  await ConnectionModel.destroy({
    where: {
      id: connection_id
    }
  })
};
