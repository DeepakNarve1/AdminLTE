"use client";

import { Provider } from "react-redux";
import store from "@app/store/store";
import { ReactNode } from "react";
import "@app/utils/i18n";

export function Providers({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
