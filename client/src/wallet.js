import * as nearAPI from "near-api-js";
import { getConfig } from "./config";

export async function initWallet() {
  const config = getConfig(process.env.NODE_ENV);

  const connectConfig = {
    networkId: config.networkId,
    keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: config.nodeUrl,
    walletUrl: config.walletUrl,
    helperUrl: config.helperUrl,
    explorerUrl: config.explorerUrl,
  };

  const near = await nearAPI.connect(connectConfig);
  const wallet = new nearAPI.WalletConnection(near, "nearkick");
  const account = wallet.account();

  const contract = new nearAPI.Contract(account, config.contractAddress, {
    viewMethods: [
      "get_project",
      "get_all_projects",
      "get_all_projects_by_owner",
    ],
    changeMethods: [
      "add_project",
      "update_project",
      "add_supporter_to_project",
      "cancel_project",
      "verify_supporter_on_project",
    ],
    sender: account,
  });

  return { wallet, contract };
}
