const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export function getConfig(env) {
  switch (env) {
    case "notconfigured":
      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        contractAddress: CONTRACT_ADDRESS,
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
      };
    case "production":
    case "development":
    case "test":
      return {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
        contractAddress: CONTRACT_ADDRESS,
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
      };
    default:
      throw Error(
        `Unconfigured environment '${env}'. Can be configured in src/config.js.`
      );
  }
}
