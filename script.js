const row1 = "ABCDEFGHIJKLM".split("");
const row2 = "NOPQRSTUVWXYZ".split("");

// Randomly assign "+" or "-" to each letter
const assignSigns = (letters) => {
  return letters.map((letter) => {
    const sign = Math.random() > 0.5 ? "+" : "-";
    return { letter, sign };
  });
};

const column1 = assignSigns(row1);
const column2 = assignSigns(row2);

const getLetterIndex = (letter) => {
  return letter.charCodeAt(0) - "A".charCodeAt(0) + 1;
};

const createColumn = (column, columnId) => {
  const columnElement = document.getElementById(columnId);
  column.forEach(({ letter, sign }) => {
    const button = document.createElement("button");
    button.innerText = `${sign}${letter}`;
    button.onclick = (event) => selectLetter(letter, sign, columnId, event);
    columnElement.appendChild(button);
  });
};

let playerPick1 = null;
let playerSign1 = null;
let playerPick2 = null;
let playerSign2 = null;

const selectLetter = (letter, sign, columnId, event) => {
  if (columnId === "column1") {
    playerPick1 = letter;
    playerSign1 = sign;
  } else {
    playerPick2 = letter;
    playerSign2 = sign;
  }

  document.querySelectorAll(`#${columnId} button`).forEach((button) => {
    button.classList.remove("selected");
  });

  event.target.classList.add("selected");
};

const calculateScore = (playerIndex, machineIndex, sign) => {
  return sign === "+" ? machineIndex - playerIndex : playerIndex - machineIndex;
};

const playRound = (playerPick1, playerSign1, playerPick2, playerSign2) => {
  const machinePick1 = row1[Math.floor(Math.random() * row1.length)];
  const machinePick2 = row2[Math.floor(Math.random() * row2.length)];

  const machineIndex1 = getLetterIndex(machinePick1);
  const playerIndex1 = getLetterIndex(playerPick1);
  const machineIndex2 = getLetterIndex(machinePick2);
  const playerIndex2 = getLetterIndex(playerPick2);

  const score1 = calculateScore(playerIndex1, machineIndex1, playerSign1);
  const score2 = calculateScore(playerIndex2, machineIndex2, playerSign2);

  const totalScore = score1 + score2;

  return {
    playerPick1: `${playerSign1}${playerPick1}`,
    playerPick2: `${playerSign2}${playerPick2}`,
    machinePick1,
    machinePick2,
    score1,
    score2,
    totalScore,
    machineIndex1,
    playerIndex1,
    machineIndex2,
    playerIndex2,
  };
};

const playGame = async () => {
  if (!playerPick1 || !playerPick2) {
    alert("Please select a letter from each column.");
    return;
  }

  const result = playRound(playerPick1, playerSign1, playerPick2, playerSign2);

  console.log("Player Sign 1:", playerSign1);
  console.log("Player Pick 1:", result.playerPick1);
  console.log("Player Sign 2:", playerSign2);
  console.log("Player Pick 2:", result.playerPick2);
  console.log("Machine Pick 1:", result.machinePick1);
  console.log("Machine Pick 2:", result.machinePick2);
  console.log("Player Index 1:", result.playerIndex1);
  console.log("Player Index 2:", result.playerIndex2);
  console.log("Machine Index 1:", result.machineIndex1);
  console.log("Machine Index 2:", result.machineIndex2);
  console.log("Score 1:", result.score1);
  console.log("Score 2:", result.score2);
  console.log("Total Score:", result.totalScore);

  const resultElement = document.getElementById("result");
  resultElement.innerHTML = `
      <p>Machine Picks: ${result.machinePick1}, ${result.machinePick2}</p>
      <p>Player Picks: ${result.playerPick1}, ${result.playerPick2}</p>
      <p>Total score: ${result.score1} + ${result.score2} = ${result.totalScore}</p>
    `;

  if (result.totalScore > 5) {
    await mintNFT();
  } else {
    alert("Your score is not high enough to mint an NFT.");
  }
};

const mintNFT = async () => {
  const polkadotAddress = document.getElementById("polkadotAddress").value;
  const privateKey = document.getElementById("privateKey").value;

  if (!polkadotAddress) {
    alert("Please enter a valid Polkadot address.");
    return;
  }

  if (!privateKey) {
    alert("Please enter your private key.");
    return;
  }

  // Connect to the Unique Network SDK
  const wsProvider = new WsProvider('wss://quartz.unique.network');
  const api = await ApiPromise.create({ provider: wsProvider });
  const sdk = new UniqueNetworkSdk(api);

  const keyring = new Keyring({ type: 'sr25519' });
  const account = keyring.addFromUri(privateKey);

  // Ensure you have sufficient balance
  const balance = await sdk.balance.get(account.address);
  console.log(`${account.address} balance:`, balance.availableBalance.formatted);

  const requiredBalance = BigInt(1000000000000); // Replace with the actual required balance
  if (balance.availableBalance.value < requiredBalance) {
    alert("Insufficient balance to mint NFT.");
    return;
  }

  const collectionId = await createCollection(sdk, account);

  const nftData = {
    collectionId,
    address: polkadotAddress,
    tokens: [
      { data: { image: "https://gateway.pinata.cloud/ipfs/QmTkhTg5S5zrqJL3UsKtyiFi8fcMT3Cao9uKtadp3Ckh7m" } },
    ]
  };

  const mintNftTx = await sdk.token.mintNFTs(nftData, account);

  const [nft] = mintNftTx.result;
  console.log('Minted token:', nft.tokenId);

  console.log(`NFT minted and sent to ${polkadotAddress}`);
};

document.addEventListener("DOMContentLoaded", () => {
  createColumn(column1, "column1");
  createColumn(column2, "column2");
});