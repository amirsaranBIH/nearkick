import { createContext, useState } from "react";

const LoadingContext = createContext({
  loading: false,
});

export function LoadingContextProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const context = {
    loading,
    setLoading,
  };

  return (
    <LoadingContext.Provider value={context}>
      {children}
    </LoadingContext.Provider>
  );
}

export default LoadingContext;
