const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const NoticiasModule = buildModule("NoticiasModule", (m) => {
  const noticias = m.contract("NOticias");

  return { noticias };
});

module.exports = NoticiasModule;