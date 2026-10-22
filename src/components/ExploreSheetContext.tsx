import { createContext, useContext } from "react";

// The tab navigator reserves no space for its bar while Explore presents a sheet.
export const ExploreSheetContext = createContext<(visible: boolean) => void>(() => {});
export const useExploreSheetVisibility = () => useContext(ExploreSheetContext);
