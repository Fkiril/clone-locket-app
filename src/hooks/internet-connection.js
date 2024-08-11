import { create } from "zustand";

export const useInternetConnection = create((set) => ({
    connectionState: navigator.onLine,
    setConnectionState: (state) => {
        return set({ connectionState: state });
    }
}))