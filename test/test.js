const game = artifacts.require('Game')
const truffleAssert = require('truffle-assertions');


//Contract to check Player- Computer Game (3 rounds per game)
contract('Game', function (accounts) {
  let instance;
  let owner=accounts[0];
  let player1=accounts[1];
  let player2=accounts[2];

  before(async () => {
      instance = await game.deployed();
  });


  //Test 1
  it('Owner Sends Ethers to contract Balance is Successful',async () => { 
      await console.log("TestCase : Checking if Owner is able to send ethers to contract Balance -");
    
      let Balance2=await instance.showBalance();
      let Balance=await instance.showContractBalance();
      console.log("OwnerBalance before transfer :"+Balance2);
      console.log("ContractBalance before transfer :"+Balance);

      await instance.transfertocontract({from:owner,value:web3.utils.toWei("3","ether")});

      let Balance3=await instance.showContractBalance();
      let Balance4=await instance.showBalance();
      console.log("OwnerBalance after transfer :"+Balance4);
      console.log("ContractBalance after transfer :"+Balance3);

    });


  //Test 2:- Owner should not be a player.
  it('Owner Cannot be the player :',async () => {
      await console.log("TestCase : Checking if Owner is a player -");
      await truffleAssert.reverts(instance.p_init({from:owner,value:web3.utils.toWei("2","ether")}),"cannot play with yourself");
    });


  //Test 3- bet > 0.
  it('Bid Amount cannot be <= 0 :',async () => {
      await console.log("TestCase : checking if bet > 0 -");
      await truffleAssert.reverts(instance.p_init({from:player1,value:web3.utils.toWei("0","ether")}),"bet must be > 0");
    });


  //Test  - full game flow with computer with ethers transfer to winner at end
  it('Full Player vs Computer Game Flow Successful :',async () => {
      await console.log("TestCase  : Full Player vs Computer Game Flow Testing-");
      await instance.p_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount = await instance.getCurrentGameId();
      console.log("game id :"+gamecount);


      console.log("Balances before match  :");
      let BalanceC1=await instance.showContractBalance();
      console.log("BalanceContract :"+BalanceC1);
      let BalanceO1=await instance.showBalance({from:owner});
      console.log("BalanceOwner :"+BalanceO1);
      let BalanceP1=await instance.showBalance({from:player1});
      console.log("BalancePlayer :"+BalanceP1);

      await instance.pmove(gamecount,4,{from:player1});
      await instance.pmove(gamecount,1,{from:player1});
      await instance.pmove(gamecount,2,{from:player1});
  
      console.log("Balances after match  :");
      let BalanceC=await instance.showContractBalance();
      console.log("BalanceContract :"+BalanceC);
      let BalanceO=await instance.showBalance({from:owner});
      console.log("BalanceOwner :"+BalanceO);
      let BalanceP=await instance.showBalance({from:player1});
      console.log("BalancePlayer :"+BalanceP);

      // checking values   
      // const game1 = await instance.computer_game.call(1);
      // const {flag, addrp, val, choice, count, wins } = await game1;
      // console.log(game1);

    });


  it('Player other than Player1 cannot enter the game :',async () => {

      await console.log("TestCase  : Checking if any other Player other than Player1 can enter the game -");
      await instance.p_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount = await instance.getCurrentGameId();
      console.log("game id :"+gamecount);

      await instance.pmove(gamecount,4,{from:player1});
      await truffleAssert.reverts(instance.pmove(gamecount,1,{from:player2}),"invalid player");

    });


  it('Player1 cannot enter the Invalid choice (<1 && >5 ):',async () => {

      await console.log("TestCase  : Checking if Player1 can enter the Invalid choice -");
      await instance.p_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount = await instance.getCurrentGameId();
      console.log("game id :"+gamecount);

      await truffleAssert.reverts(instance.pmove(gamecount,8,{from:player1}),"Invalid choice");

    });

  })



/////////////////////


//Contract to check Player- Player Game (4 rounds per game)
contract('Game', function (accounts) {
  let instance;
  let owner=accounts[0];
  let player1=accounts[4];
  let player2=accounts[5];

  before(async () => {
      instance = await game.deployed();
  });

  //Test 1 - full game flow with Player Player 
  it('Full Player vs Player Game Flow Testing when Game Draws is Successful :',async () => {
      await console.log("TestCase  : Checking Full Player vs Player Game Flow Testing when Game Draws-");
      await instance.p1_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount = await instance.getCurrentGameId();
      console.log("game id :"+gamecount);

      await instance.p2_init(gamecount,{from:player2,value:web3.utils.toWei("2","ether")});

    console.log("Balances before match  :");
    let BalanceC1=await instance.showContractBalance();
    console.log("BalanceContract :"+BalanceC1);
    let BalanceO1=await instance.showBalance({from:owner});
    console.log("BalanceOwner :"+BalanceO1);
    let BalanceP1=await instance.showBalance({from:player1});
    console.log("BalancePlayer1 :"+BalanceP1);
    let BalanceP2=await instance.showBalance({from:player2});
    console.log("BalancePlayer2 :"+BalanceP2);


      //round1
      let p1move=2;
      let p1nonce=500;
      let p1hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p1_hashmove(gamecount,p1hash,{from:player1});

      let p2move=5;
      let p2nonce=600;
      let p2hash="0xa1896a8aee6b4620b0ae83f86e9abc0a2267526fe4470b519a98645194decba6";

      await instance.p2_hashmove(gamecount,p2hash,{from:player2});

      let p1string = "2500";
      await instance.p1_reveal(gamecount,p1string,{from:player1});

      let p2string = "5600";
      await instance.p2_reveal(gamecount,p2string,{from:player2});


      //round2
      p1move=5;
      p1nonce=600;
      p1hash="0xa1896a8aee6b4620b0ae83f86e9abc0a2267526fe4470b519a98645194decba6";
      await instance.p1_hashmove(gamecount,p1hash,{from:player1});

      p2move=2;
      p2nonce=220;
      p2hash="0x26575d7093b9e2308e84f72221be5a57716e858ab053c2f52c3f486c6b3f791c";
      await instance.p2_hashmove(gamecount,p2hash,{from:player2});


      p1string = "5600";
      await instance.p1_reveal(gamecount,p1string,{from:player1});

      p2string = "2220";
      await instance.p2_reveal(gamecount,p2string,{from:player2});


      //round3
      p1move=1;
      p1nonce=400;
      p1hash="0x7fac02d34be0cf003870fc1ca20de764e3d24f4510f938a3d8c85c13150f33d3";
      await instance.p1_hashmove(gamecount,p1hash,{from:player1});

      p2move=2;
      p2nonce=500;
      p2hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p2_hashmove(gamecount,p2hash,{from:player2});


      p1string = "1400";
      await instance.p1_reveal(gamecount,p1string,{from:player1});

      p2string = "2500";
      await instance.p2_reveal(gamecount,p2string,{from:player2});



      //round4
      p1move=3;
      p1nonce=300;
      p1hash="0x63cb231b2ae1787bf0f001c937e5baec8a8a9b2b66988e66ebb1181967d1f413";
      await instance.p1_hashmove(gamecount,p1hash,{from:player1});

      p2move=2;
      p2nonce=500;
      p2hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p2_hashmove(gamecount,p2hash,{from:player2});


      p1string = "3300";
      await instance.p1_reveal(gamecount,p1string,{from:player1});

      p2string = "2500";
      await instance.p2_reveal(gamecount,p2string,{from:player2});

    console.log("Balances After match  :");
    let BalanceC=await instance.showContractBalance();
    console.log("BalanceContract :"+BalanceC);
    let BalanceO=await instance.showBalance({from:owner});
    console.log("BalanceOwner :"+BalanceO);
    let BalancePP1=await instance.showBalance({from:player1});
    console.log("BalancePlayer1 :"+BalancePP1);
    let BalancePP2=await instance.showBalance({from:player2});
    console.log("BalancePlayer2 :"+BalancePP2);

    //checking values
    // const game1 = await instance.game.call(1);
    // console.log(game1);

    });



  //Test 2 - full game flow with Player Player 
  it('Full Player vs Player Game Flow Testing when Player1 wins is Successful :',async () => {
      
      await console.log("TestCase  : Checking Full Player vs Player Game Flow Testing when Player1 wins-");
      await instance.p1_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount1 = await instance.getCurrentGameId();
      console.log("game id :"+gamecount1);

      await instance.p2_init(gamecount1,{from:player2,value:web3.utils.toWei("2","ether")});

    console.log("Balances before match  :");
    let BalanceCC1=await instance.showContractBalance();
    console.log("BalanceContract :"+BalanceCC1);
    let BalanceOC1=await instance.showBalance({from:owner});
    console.log("BalanceOwner :"+BalanceOC1);
    let BalancePC1=await instance.showBalance({from:player1});
    console.log("BalancePlayer1 :"+BalancePC1);
    let BalancePC2=await instance.showBalance({from:player2});
    console.log("BalancePlayer2 :"+BalancePC2);

      //round1 
      let p1move=2;
      let p1nonce=500;
      let p1hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p1_hashmove(gamecount1,p1hash,{from:player1});

      let p2move=5;
      let p2nonce=600;
      let p2hash="0xa1896a8aee6b4620b0ae83f86e9abc0a2267526fe4470b519a98645194decba6";

      await instance.p2_hashmove(gamecount1,p2hash,{from:player2});

      let p1string = "2500";
      await instance.p1_reveal(gamecount1,p1string,{from:player1});

      let p2string = "5600";
      await instance.p2_reveal(gamecount1,p2string,{from:player2});


      //round2
      p1move=5;
      p1nonce=600;
      p1hash="0xa1896a8aee6b4620b0ae83f86e9abc0a2267526fe4470b519a98645194decba6";
      await instance.p1_hashmove(gamecount1,p1hash,{from:player1});

      p2move=2;
      p2nonce=220;
      p2hash="0x26575d7093b9e2308e84f72221be5a57716e858ab053c2f52c3f486c6b3f791c";
      await instance.p2_hashmove(gamecount1,p2hash,{from:player2});


      p1string = "5600";
      await instance.p1_reveal(gamecount1,p1string,{from:player1});

      p2string = "2220";
      await instance.p2_reveal(gamecount1,p2string,{from:player2});


      //round3
      p1move=1;
      p1nonce=400;
      p1hash="0x7fac02d34be0cf003870fc1ca20de764e3d24f4510f938a3d8c85c13150f33d3";
      await instance.p1_hashmove(gamecount1,p1hash,{from:player1});

      p2move=2;
      p2nonce=500;
      p2hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p2_hashmove(gamecount1,p2hash,{from:player2});


      p1string = "1400";
      await instance.p1_reveal(gamecount1,p1string,{from:player1});

      p2string = "2500";
      await instance.p2_reveal(gamecount1,p2string,{from:player2});

      //round4
      p1move=3;
      p1nonce=300;
      p1hash="0x63cb231b2ae1787bf0f001c937e5baec8a8a9b2b66988e66ebb1181967d1f413";
      await instance.p1_hashmove(gamecount1,p1hash,{from:player1});

      p2move=4;
      p2nonce=500;
      p2hash="0x428d8b18c23216179dc93bf0dc10675483e78cd84ac70f88f12fee79128ca70c";
      await instance.p2_hashmove(gamecount1,p2hash,{from:player2});


      p1string = "3300";
      await instance.p1_reveal(gamecount1,p1string,{from:player1});

      p2string = "4500";
      await instance.p2_reveal(gamecount1,p2string,{from:player2});

    console.log("Balances After match  :");
    let BalanceCC=await instance.showContractBalance();
    console.log("BalanceContract :"+BalanceCC);
    let BalanceOC=await instance.showBalance({from:owner});
    console.log("BalanceOwner :"+BalanceOC);
    let BalancePPC1=await instance.showBalance({from:player1});
    console.log("BalancePlayer1 :"+BalancePPC1);
    let BalancePPC2=await instance.showBalance({from:player2});
    console.log("BalancePlayer2 :"+BalancePPC2);

    //checking values
    // const game2 = await instance.game.call(2);
    // console.log(game2);

    });


  it('Same Player cannot be player1 and Player2 is Successful :',async () => {
      
      await console.log("TestCase  : Checking Same Player cannot be player1 and Player2-");
      await instance.p1_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount1 = await instance.getCurrentGameId();
      console.log("game id :"+gamecount1);

      await truffleAssert.reverts(instance.p2_init(gamecount1,{from:player1,value:web3.utils.toWei("2","ether")}),"cannot play with yourself");

    });


  it('Player1 cannot be Unauthorized at the gameid is Successful',async () => {
      
      await console.log("Player1 cannot be Unauthorized-");
      await instance.p1_init({from:player1,value:web3.utils.toWei("2","ether")});

      const gamecount1 = await instance.getCurrentGameId();
      console.log("game id :"+gamecount1);

      await instance.p2_init(gamecount1,{from:player2,value:web3.utils.toWei("2","ether")});

      //round1 
      let p1move=2;
      let p1nonce=500;
      let p1hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      // await instance.p1_hashmove(gamecount1,p1hash,{from:player1});
      await truffleAssert.reverts(instance.p1_hashmove(gamecount1,p1hash,{from:player2}),"you are not player1 with this id");

    });


  it('Player2 cannot be Unauthorized at the gameid is Successful',async () => {
      
      await console.log("Player2 cannot be Unauthorized-");
      await instance.p1_init({from:player1,value:web3.utils.toWei("2","ether")});
      const gamecount1 = await instance.getCurrentGameId();
      console.log("game id :"+gamecount1);
      await instance.p2_init(gamecount1,{from:player2,value:web3.utils.toWei("2","ether")});
      
      //round1 
      let p1move=2;
      let p1nonce=500;
      let p1hash="0xa30f2bde19aa6eca5984613d4c4ee4da3b7d96f14d4e7174d07018e456790aac";
      await instance.p1_hashmove(gamecount1,p1hash,{from:player1});

      let p2move=5;
      let p2nonce=600;
      let p2hash="0xa1896a8aee6b4620b0ae83f86e9abc0a2267526fe4470b519a98645194decba6";
      await truffleAssert.reverts(instance.p2_hashmove(gamecount1,p2hash,{from:owner}),"you are not player2 with this id");

    });





  })

