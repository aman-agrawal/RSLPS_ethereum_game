pragma solidity >=0.4.22 <0.6.0;

contract Game 
{

    struct single_player
    {
        bool flag;
        address payable p;
        uint val;	//bid amount
        uint choice;
        uint game_count;
        uint p_win;
    }

    struct two_player
    {
        bool flag;
        address payable p1;
        address payable p2;
        uint val;
        uint choice1;
        uint choice2;
        bytes32 hash1;
        bytes32 hash2;
        uint game_count;
        uint p1_win;
    }
    
    address payable public owner;
    uint total_count=0;

    
    uint rnumber=1;
    uint public contract_balance;
  
    mapping(uint => single_player) public computer_game;
    mapping(uint => two_player) public game;  

    event out(string s, uint p1c, uint p2c);
    
    event choicesTestting(string s, uint pchoice, uint cchoice);


    constructor ()payable public
    {
        owner = msg.sender;
    }
    
    function() payable external{}

    function transfertocontract() external payable
    {
        require(owner == msg.sender, 'you are not owner');
        address(this).transfer(msg.value);
        contract_balance=msg.value;
    }
    
    function p_init() public payable 
    {
        require(owner != msg.sender, 'cannot play with yourself');
        require(msg.value > 0, 'bet must be > 0');

        //insert player address in p and bidamt in val
        computer_game[++total_count] = single_player({flag:true, p: msg.sender, val: msg.value,choice:0,game_count:0,p_win:0});
        contract_balance -= msg.value;
        
    } 

    function getCurrentGameId()public view returns(uint)
    {
        return total_count;
    }
    // //
    
    function showContractBalance() public view returns(uint)
    {
        return (address(this).balance/(1 ether));
    }
    
    function showBalance() public view returns(uint)
    {
     return (msg.sender.balance/(1 ether));
    }

    function pmove(uint id, uint choice) external payable returns (uint computer_choice)
    {
        require(owner!= msg.sender, 'cannot play with yourself');
        require(computer_game[id].p == msg.sender, 'invalid player');
        require(uint(choice) <= 5 && uint(choice) >= 1, 'Invalid choice');
        

        computer_game[id].choice=choice;
        computer_game[id].game_count = computer_game[id].game_count + 1;

        rnumber=rnumber + 3;
        uint rnd = uint(uint256(sha256(abi.encodePacked(rnumber, block.difficulty)))) % 5 + 1;
        uint ans = reveal_winner_single_player(id,rnd);
        
        if(ans==1)
        {
          computer_game[id].p_win=computer_game[id].p_win + 1; 
        }
        if(computer_game[id].game_count == 3)
        {
            if(computer_game[id].p_win > 1)
            {
                computer_game[id].p.transfer(computer_game[id].val * 2);
                owner.transfer(contract_balance);
            }
            else 
            {
                contract_balance += 2 * computer_game[id].val;
                owner.transfer(contract_balance);
            }
            
            // delete computer_game[id]; ?
        }
        


        //emit choicesTestting("choices :",computer_game[id].choice, rnd);

        //computer_game[id].choice=0;
        
        return rnd;
    }
    
    
    function reveal_winner_single_player(uint id,uint computer_choice) internal view returns (uint) 
    {
        require(computer_game[id].p==msg.sender, 'unauthoried player revealing');
        uint t1=computer_game[id].choice;

        if(t1 == computer_choice) return 0;
        if((t1%5)+1 == computer_choice || (t1%5)+2 == computer_choice) return 1;
        else return 2;
    }
    
    function p1_init() external payable  
    {
        require(msg.value > 0, 'bet must be > 0');
        game[++total_count] = two_player({p1: msg.sender,p2: address(0),val: msg.value,choice1:0,choice2:0,game_count:0,p1_win:0,hash1:0,hash2:0,flag:true});
    }

    function p2_init(uint id) external payable
    {
        require(game[id].flag==true, 'player1 absent');
        require(game[id].p1 != msg.sender, 'cannot play with yourself');
        require(msg.value == game[id].val, 'betting amount mismatch');

        game[id] = two_player({p1: game[id].p1, p2:msg.sender, val: game[id].val,choice1:0,choice2:0,game_count:0,p1_win:0,hash1:0,hash2:0,flag:true});
    }

    function p1_hashmove(uint id, bytes32 hashVal) external 
    {
        require(msg.sender == game[id].p1 , 'you are not player1 with this id');
        require(game[id].hash1 == 0, 'u cannot change ur move in same turn');
        game[id].hash1 = hashVal;
    }
    
    
    function p2_hashmove(uint id, bytes32 hashVal) external 
    {
        require(msg.sender == game[id].p2 , 'you are not player2 with this id');
        require(game[id].hash2 == 0, 'u cannot change ur move in same turn');
        game[id].hash2 = hashVal;
    }
    
    
    function p1_reveal(uint id, string memory x)  public returns(uint) 
    {
        require(game[id].p1 == msg.sender, 'you are not player1 with this id');
        require(game[id].hash1 != 0 , "hashmoves are not drawn yet");
        
        bytes memory y = bytes(x);
        require(game[id].hash1 == keccak256(y), 'Hash and current choices mismatched');
        
        uint p1move = byteToMove(y[0]);
        game[id].choice1 = p1move;
        
        require(uint(game[id].choice1) <= 5 || uint(game[id].choice1) >= 1, 'Invalid choice by player1');
        
        return game[id].choice1;
    }
    
    
    
    function p2_reveal(uint id, string memory x) public
    {
        require(game[id].p2 == msg.sender, 'you are not player2 with this id');
        require(game[id].hash1 != 0 && game[id].hash2 != 0 , "hashmoves are not drawn yet");

        bytes memory y = bytes(x);
        require(game[id].hash2 == keccak256(y), 'Hash and current choices mismatched');
        
        uint p2move = byteToMove(y[0]);
        game[id].choice2 = p2move;
        
        require(uint(game[id].choice2) <= 5 || uint(game[id].choice2) >= 1, 'Invalid choice by player2');
        
        //checking value of p1choice and p2choice    
        emit out("Debugging....", game[id].choice1, game[id].choice2);
        
        uint ans=reveal_winner(id);
        if(ans==1)
        {
           game[id].p1_win=game[id].p1_win + 1; 
        }
        game[id].game_count = game[id].game_count + 1;
        
        //play for 4 turns
        if(game[id].game_count == 4)
        {
            if(game[id].p1_win > 2)game[id].p1.transfer(game[id].val * 2);
            else if(game[id].p1_win < 2)game[id].p2.transfer(game[id].val * 2);
            else 
            {
                contract_balance += 2 * game[id].val;
                //owner.transfer(game[id].val * 2);
                owner.transfer(contract_balance);
            
            }
        }
        
        game[id].choice1=0;game[id].choice2=0;
        game[id].hash1=0;game[id].hash2=0;
        
    }
    
    function reveal_winner(uint id) internal view returns (uint) 
    {
        require(game[id].p1==msg.sender || game[id].p2==msg.sender, 'unauthoried player revealing');
        uint t1=game[id].choice1;
        uint t2=game[id].choice2;

        if(t1 == t2) return 0;
        if((t1%5)+1 == t2 || (t1%5)+2 == t2) return 1;
        else return 2;
    }
    
    
    function byteToMove(bytes1 b) private pure returns (uint) {
        if(b == '1')
            return 1;
        if(b == '2')
            return 2;
        if(b == '3')
            return 3;
        if(b == '4')
            return 4;
        
        return 5;
    }
    
}
