import React, { FC, useMemo, ReactNode, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
  GlowWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProtectedRoute from "./components/ProtectedRoute";

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

const TARGET_NFT = "Smug Monkey's #170"

const WalletContext: FC<{ children: ReactNode }> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletContent: FC = () => {
  const { publicKey } = useWallet();

  const [nfts, setNFTs] = useState<Array<any>>([]);
  const [authenticated, setAuthenticated] = useState(0);

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  useEffect(() => {
    console.log("chjecking: " + authenticated)
    if (authenticated == 1) {
      const auth_token = "token"
      window.localStorage.setItem("auth_token", JSON.stringify(auth_token));
      console.log("success")
    }
  }, [authenticated]);

  async function authenticateWallet() {
    setNFTs([]);

    if (!publicKey) {
      throw new WalletNotConnectedError();
    }
    const MY_WALLET_ADDRESS = publicKey.toBase58();


    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // number of bytes
          },
          {
            memcmp: {
              offset: 32, // number of bytes
              bytes: MY_WALLET_ADDRESS, // base58 encoded string
            },
          },
        ],
      }
    );
    console.log(
      `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
    );



    const promises = accounts.map((account: any) => getAccountMetaData(account.account.data["parsed"]["info"]["mint"], account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]));
    await Promise.all(promises);
    if (authenticated == 0) {
      setAuthenticated(2);
    }
  }

  async function getAccountMetaData(mintAddress: String, amount: Number) {
    let mintPubkey = new PublicKey(mintAddress);
    let tokenmetaPubkey = await Metadata.getPDA(mintPubkey);
    const tokenmeta: any = await Metadata.load(connection, tokenmetaPubkey);

    let nft_object: any = {};
    nft_object.name = tokenmeta.data.data["name"]

    if (nft_object.name == TARGET_NFT) {

      setAuthenticated(1)
      console.log(nft_object.name, authenticated)
    }

    await fetch(tokenmeta.data.data["uri"])
      .then((response) => response.json())
      .then((responseJson) => {
        nft_object.image = responseJson.image
        let updated_nft = nfts
        updated_nft.push(nft_object)
        setNFTs(updated_nft)
        console.log("got nft")
        console.log(nfts)
      })
  }

  // function renderNFTs() {
  //   if (loading) {
  //     return (
  //       <div>
  //         No NFTs detected so far...
  //       </div>
  //     )
  //   }
  //   else {
  //     return (
  //       <div>
  //         {nfts.map(nft => (
  //           <div key={nft.name}>
  //             <div>
  //               {nft.name}
  //             </div>
  //             <img src={nft.image} style={{ width: 100, height: 100 }} />
  //           </div>
  //         ))}
  //       </div>
  //     )
  //   }
  // }

  function renderLanding() {

    let disabled = publicKey == null;
    let buttonText = disabled ? "Wallet Disconnected" : "Authenticate"

    return (
      <button disabled={disabled} className={"button "} onClick={() => authenticateWallet()} style={{ fontSize: "18px", background: "#6c25be", padding: 10, borderRadius: 5, color: "white", borderColor: "#6c25be" }}>
        {buttonText}
      </button>
    )
  }

  if(authenticated == 1) {
    return <Navigate to={'/home'} replace/>
  }
  else {
    return (
        <div className={"section"} style={{ background: "#2A2D34", height: "100vh", width: "100vw" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <WalletMultiButton />
            <div style={{ fontSize: "18px", color: "white", display: "flex", flexDirection: "row", margin: "auto" }}>
              <div className={"mx-2"}>
                Discord
              </div>
              <div className={"mx-2"}>
                Twitter
              </div>
            </div>
            <WalletDisconnectButton />
          </div>
          <div className={"mt-5"} style={{ textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className={"my-5 title is-1"} style={{ color: "#6c25be" }}>
              SMUG MONKEE DAO
            </div>
            <div className={"mt-5 subtitle"} style={{ color: "white" }}>
              Please connect your wallet and authenticate.
            </div>
            <div className={"mb-5 subtitle"} style={{ color: "white" }}>
              Only "Smug Monkey's #170" holders allowed.
            </div>
            {renderLanding()}
          </div>
          <div className={"modal" + (authenticated == 2 ? " is-active" : "")}>
            <div className="modal-background"/>
            <div className="modal-content" style={{background: "white", padding: 10, borderRadius: 5}}>
              u aint got the monkee bruv
            </div>
            <button onClick={() => setAuthenticated(0)} className="modal-close is-large" aria-label="close"></button>
          </div>
        </div>
    )
  }
}

const App: FC = () => {

  return (
    <WalletContext>
      <BrowserRouter>
        <Routes>
          <Route path={"/"} element={<WalletContent/>} />
          <Route path={"/home"} element={<ProtectedRoute/>}>
            <Route path={"/home"} element={<HomePage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletContext>
  );
};
export default App;

