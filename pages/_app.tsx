import React, { Fragment } from "react";
import Router from "next/router";
import { wrapper } from "@/store";
import { MantineProvider } from "@mantine/core";

// types
import type { AppProps } from "next/app";

// global styles
import "@mantine/core/styles.css";
import "swiper/css";
import "antd/dist/reset.css";
import "rc-slider/assets/index.css";
import "../assets/css/styles.scss";

import * as gtag from "./../utils/gtag";
import { theme } from "@/utils/theme";

const isProduction = process.env.NODE_ENV === "production";

// only events on production
if (isProduction) {
  // Notice how we track pageview when route is changed
  Router.events.on("routeChangeComplete", (url: string) => gtag.pageview(url));
}

const MyApp = ({ Component, pageProps }: AppProps) => (
  <MantineProvider theme={theme}>
    <Fragment>
      <Component {...pageProps} />
    </Fragment>
  </MantineProvider>
);

export default wrapper.withRedux(MyApp);
