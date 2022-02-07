pragma solidity >=0.4.22 <0.9.0; // 버전 프라그마 (해당 버전 사이에 있어야 컴파일 된다는 뜻)
//pragma solidity >=0.4.24 <=0.5.4;

contract CoinFlips {

    uint constant MAX_CASE = 2;             // 앞 뒤 두 가지 케이스
    uint constant MIN_BET = 0.01 ether;     // 최소 베팅 금액
    uint constant MAX_BET = 10 ether;       // 최대 베팅 금액
    uint constant HOUSE_FEE_PERCENT = 5;    // 수수료 퍼센트
    uint constant HOUSE_MIN_FEE = 0.005 ether;  // 최소 수수료 금액

    address public owner;
    uint public lockedInBets;


    // 베팅 정보를 저장하기 위한 구조체
    struct Bet {
        uint amount;    // 베팅금액(wei)
        uint8 numOfBetBit;    // 플레이어가 선택한 면의 개수
        uint placeBlockNumber;  // 플레이어가 베팅한 거래 정보가 담긴 블록 번호
        uint8 mask; // 플레이어가 선택한 동전 면
        address gambler;    // 플레이어의 계정주소
    }

    mapping (address => Bet) bets;

    event Reveal(uint reveal);  // 1 or 2
    event Payment(address indexed beneficiary, uint amount);
    event FailedPayment(address indexed beneficiary, uint amount);

    constructor() public {
        owner = msg.sender;
    }

    // owner일때만 수행하도록 도와주는 modifier
    modifier onlyOwner {
        require (msg.sender == owner, "Only owner can call this function.");
        _;
    }

    // 이더리움 인출 메소드
    function withdrawFunds(address beneficary, uint withdrawAmount) external onlyOwner {
        // 인출할 수 있는 금액보다 작거나 같은 경우만 인출 가능
        require (withdrawAmount + lockedInBets <= address(this).balance, "larger than balance.");
        sendFunds(beneficary, withdrawAmount);
    }

    // 이더리움 전송 메소드
    function sendFunds(address beneficiary, uint amount) private {
        if(beneficiary.send(amount)) {
            emit Payment(beneficiary, amount);
        }
        else {
            emit FailedPayment(beneficiary, amount);
        }
    }

    // 컨트랙트 비활성화 함수
    function kill() external onlyOwner {
        require(lockedInBets == 0, "All bets should be processed before self-destruct.");
        selfdestruct(owner);
    }

    // Fallback 함수, 이더리움 받기 위함
    function() external payable {}

    // 플레이어가 화면의 베팅 버튼을 클릭했을 때 호출하는 매소드
    function placeBet(uint8 betMask) external payable { // payable로 선언해서 얼마를 배팅했는지는 전달하지 않음
        uint amount = msg.value;


        require(amount >= MIN_BET && amount <= MAX_BET, "Amount is out of range.");
        require(betMask > 0 && betMask < 256, "Mask should be 8 bit");

        // storage는 함수내부에 선언된 로컬 변수가 레퍼런스 타입의 상태변수를 참조할 때 사용 (상태변수를 가리키는 포인터)
        Bet storage bet = bets[msg.sender]; // mapping bets(address => Bet)

        // 솔리디티에는 null이 없음 address(0)이 null과 같은 의미
        require (bet.gambler == address(0), "Bet should be empty state.");

        // betMas의 bit를 세기 위함
        // 0000 0011 number of bits = 2
        // 0000 0001 number of bits = 1
        uint8 numOfBetBit = countBits(betMask);

        bet.amount = amount;
        bet.numOfBetBit = numOfBetBit;
        bet.placeBlockNumber = block.number;
        bet.mask = betMask;
        bet.gambler = msg.sender;

        // 이길시 지불할 양을 lock 해두기 위함
        uint possibleWinningAmount = getWinningAmount(amount, numOfBetBit);
        lockedInBets += possibleWinningAmount;

        require(lockedInBets < address (this).balance, "Cannot afford to pay the bet.");
        }

    // pure는 이 메소드가 계정의 상태정보에 영향을 주지 않는 메소드라는 의미 (생략가능)
    function getWinningAmount(uint amount, uint8 numOfBetBit) private pure returns (uint winningAmount) {
        require (0 < numOfBetBit && numOfBetBit < MAX_CASE, "Probability is out of range");

        uint houseFee = amount * HOUSE_FEE_PERCENT / 100;

        if(houseFee < HOUSE_MIN_FEE) {
            houseFee = HOUSE_MIN_FEE;
        }

        uint reward = amount / (MAX_CASE + (numOfBetBit-1));

        winningAmount = (amount - houseFee) + reward;
    }

    // 플레이어에게 결과를 알려주는 함수
    function revealResult(uint8 seed) external {
        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;
        uint8 numOfBetBit = bet.numOfBetBit;
        uint placeBlockNumber = bet.placeBlockNumber;
        address gambler = bet.gambler;

        require(amount > 0, "Bet should be in an 'active' state");
        // 베팅에 해당하는 블록이 결과에 해당하는 블록보다 먼저 생성되어야 하는 것을 검토하는 require
        require(block.number > placeBlockNumber, "revealResult in the same block as placeBet, or before.");

        // 난수
        bytes32 random = keccak256(abi.encodePacked(blockhas(block.number - seed), blockhash(placeBlockNumber)));

        uint reveal = uint(random) %MAX_CASE;   // 0 or 1

        uint winningAmount = 0;
        uint possibleWinningAmount =0;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        if((2 ** reveal) & bet.mask != 0) {
            winningAmount = possibleWinningAmount;
        }

        emit Reveal(2 ** reveal);

        if(winningAmount > 0) {
            sendFunds(gambler, winningAmount);
        }

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);
    }

    // 항목들 null로 세팅하는 메소드
    function clearBet(address player) private {
        Bet storage bet = bets[player];
        // for safety
        if(bet.amount > 0) {
            return;
        }
        bet.amount = 0;
        bet.numOfBetBit = 0;
        bet.placeBlockNumber = 0;
        bet.mask = 0;
        bet.gambler = address (0);
    }

    // 결과 확인 전에 환불하는 메소드
    function refundBet() external {
        require(block.number > bet.placeBlocknumber, "refundBet in the same block as placeBet, or Before");

        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;

        require (amount > 0, "Bet should be in an 'active' state");

        uint8 numOfBetBit = bet.numOfBetBit;

        // 환불
        sendFunds(bet.gambler, amount);

        uint possibleWinningAmount;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);
    }

    function checkHouseFund() public view only Owner returns(uint) {
        return address(this).balance;
    }

    function countBits(uint8 _num) internal pure returns (uint8) {
        uint8 count;
        while(_num > 0) {
            count += _num & 1;
            _num >>= 1;
        }
        return count;
    }


}

