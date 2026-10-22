import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialData, restoreData, type LocalData } from "../lib/model";
import { recordBoarding, recordPayment, consumeRewardVoucher, redeemReward, type RewardResult } from "../lib/rewards";
import { linkDemoCard, linkDemoWallet, removePaymentMethod, selectPaymentMethod, type CardDraft } from "../lib/payments";
const KEY = "townshipconnect.demo.v1";
type Store = {
  data: LocalData;
  ready: boolean;
  storageError: string | null;
  redeemVoucher: (id: string) => RewardResult<LocalData>;
  addWallet: (id: string) => RewardResult<LocalData>;
  addCard: (card: CardDraft) => RewardResult<LocalData>;
  selectPaymentAccount: (id: string) => void;
  removePaymentAccount: (id: string) => void;
  setAvatarUri: (uri: string | null) => void;
  recordPaymentScan: (token: string, amountCents: number) => RewardResult<LocalData>;
  markVoucherUsed: (id: string) => RewardResult<LocalData>;
  recordBoardingScan: (token: string) => RewardResult<LocalData>;
  update: (fn: (d: LocalData) => LocalData) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const snapshot = useRef(initialData);
  const update = useCallback((fn: (d: LocalData) => LocalData) => { const next = fn(snapshot.current); snapshot.current = next; setData(next); }, []);
  const redeemVoucher = (id: string) => { const result = redeemReward(snapshot.current, id); if (result.ok) update(() => result.data); return result; };
  const recordBoardingScan = (token: string) => { const result = recordBoarding(snapshot.current, token); if (result.ok) update(() => result.data); return result; };
  const addWallet = (id: string) => { const result = linkDemoWallet(snapshot.current, id); if (result.ok) update(() => result.data); return result; };
  const addCard = (card: CardDraft) => { const result = linkDemoCard(snapshot.current, card); if (result.ok) update(() => result.data); return result; };
  const selectPaymentAccount = (id: string) => update(d => selectPaymentMethod(d, id));
  const removePaymentAccount = (id: string) => update(d => removePaymentMethod(d, id));
  const setAvatarUri = (uri: string | null) => update(d => ({ ...d, avatarUri: uri }));
  const recordPaymentScan = (token: string, amountCents: number) => { const result = recordPayment(snapshot.current, token, amountCents); if (result.ok) update(() => result.data); return result; };
  const markVoucherUsed = (id: string) => { const result = consumeRewardVoucher(snapshot.current, id); if (result.ok) update(() => result.data); return result; };
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => { const restored = restoreData(s); snapshot.current = restored; setData(restored); })
      .catch(() => setStorageError("Local storage could not be loaded."))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (!ready) return;
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(data)))
      .catch(() => {
        setStorageError(
          "Changes are available this session but could not be saved on this device.",
        );
      });
  }, [data, ready]);
  return (
    <Context.Provider value={{ data, ready, storageError, update, redeemVoucher, recordBoardingScan, addWallet, addCard, selectPaymentAccount, removePaymentAccount, setAvatarUri, recordPaymentScan, markVoucherUsed }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing StoreProvider");
  return value;
}
