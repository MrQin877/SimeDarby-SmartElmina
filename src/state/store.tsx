import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialData, restoreData, type LocalData } from "../lib/model";
const KEY = "townshipconnect.demo.v1";
type Store = {
  data: LocalData;
  ready: boolean;
  storageError: string | null;
  update: (fn: (d: LocalData) => LocalData) => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => setData(restoreData(s)))
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
    <Context.Provider value={{ data, ready, storageError, update: setData }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing StoreProvider");
  return value;
}
