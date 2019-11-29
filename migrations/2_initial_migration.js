var Game = artifacts.require("Game.sol");
Game.numberFormat= "String";

module.exports = function(deployer) {
  deployer.deploy(Game);
};
