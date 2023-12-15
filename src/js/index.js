import {Polkadot} from '@unique-nft/utils/extension';
import { signatureVerify } from '@polkadot/util-crypto';
import {stringToHex, stringToU8a, u8aToU8a, hexToU8a, u8aWrapBytes, u8aIsWrapped, u8aUnwrapBytes} from "@polkadot/util";
import {
  isWeb3Injected,
  web3Accounts,
  web3FromSource,
  web3Enable,
  web3AccountsSubscribe, web3FromAddress, wrapBytes,
} from '@polkadot/extension-dapp';

let accounts;

async function getAccounts() {
  if (!!accounts) return;
  const $walletsSelect = document.getElementById('wallets');
  try {
    $walletsSelect.innerHTML = '';
    const extensions = await web3Enable('@unique-nft/accounts');

    const injectedAccounts = await web3Accounts();

    accounts = await Promise.all(injectedAccounts.map(async injected => {
      const injector = await web3FromAddress(injected.address);

      return {
        name: injector.name,
        address: injected.address,
        sign: injector.signer.signRaw
      }
    }))

    accounts.forEach((wallet) => {
      const option = document.createElement('option');
      option.innerHTML = `[${wallet.name}] ${wallet.address}`;
      option.value = wallet.address;
      $walletsSelect.appendChild(option);
    });
  } catch(e) {
    if (e.extensionNotFound) {
      alert(`Please install some polkadot.js compatible extension`)
    } else if (e.accountsNotFound) {
      if (e.userHasWalletsButHasNoAccounts) {
        alert(`Please, create an account in your wallet`)
      } else if (e.userHasBlockedAllWallets) {
        alert(`Please, grant access to at least one of your accounts`)
        await Polkadot.requestAccounts()
      }
    } else {
      alert(`Connection to polkadot extension failed: ${e.message}`)
    }
  }
}

async function sign() {
  const $walletsSelect = document.getElementById('wallets');
  const $messageInput = document.getElementById('message');
  const $signatureTextarea = document.getElementById('signature');

  const currentAddress = $walletsSelect.value;

  const account = accounts.find(({ address }) => currentAddress === address);

  console.log('$messageInput.value', $messageInput.value)
  const originValue = $messageInput.value;
  const { signature } = await account.sign({
    address: currentAddress,
    date: originValue,
    type: 'payload',
  });
  $signatureTextarea.value = signature;


  const { isValid } = signatureVerify(u8aWrapBytes(stringToU8a(originValue)), signature, currentAddress);
  console.log('isValid', isValid);
}

async function init() {
  console.log('Initializing2');
  const $signBtn = document.getElementById('sign');
  setTimeout(() => {
    getAccounts()
  }, 2000);
  $signBtn.addEventListener('click', sign);
}

init();
