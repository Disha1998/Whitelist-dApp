import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { Contract, providers, Signer } from 'ethers';
import { ABI, WHITELIST_CONTRACT_ADDRESS } from './constants/index'
import { sign } from 'crypto';

export default function Home() {
  const [walletConnected, setwalletConnected] = useState(false)
  const [numOfWhitelisted, setnumOfWhitelisted] = useState(0);
  const [joinedWhitelist, setjoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)

  const web3ModalrRef = useRef();


  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalrRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change the network to Goerli");
      }
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  }


  const checkIfAddressIsWhitelisted = async () => {
    try {
      const signer = getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        ABI,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      )
    } catch (err) {
      console.error(err);

    }
  }


  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        ABI,
        provider
      )
      const _numOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setnumOfWhitelisted(_numOfWhitelisted)
    } catch (err) {
      console.error(err);

    }
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        ABI,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist()
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setjoinedWhitelist(true);
    } catch (err) {
      console.error(err);

    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>Thanks for joining the whitelist!</div>
        );
      } else if (loading) {
        return (
          <button className={styles.button}>Loading....</button>
        )
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>Connect your wallet</button>

        )
      }
    } else {

      <button onClick={connectWallet} className={styles.button}>Connect your Wallet</button>

    }
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setwalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err)
    }
  }


  useEffect(() => {
    if (!walletConnected) {
      web3ModalrRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disabledInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected])
  return (
    <div>
      <Head>
        <title>
          Whitelist dApp
        </title>
        <meta name='description' content='Whitelist-dApp' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            welcome to Crypto Devs!
          </h1>
          <div className={styles.description}>
            {numOfWhitelisted} have already joind the whitelist
          </div>
          {renderButton()}

        </div>
        <div>
          <img src='./whitelist.svg' className={styles.image} />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with ♡ by Crypto Devs
      </footer>
    </div>
  )
}
