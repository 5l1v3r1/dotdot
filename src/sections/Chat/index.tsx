import React from "react";
import { Container } from "react-bootstrap";

import SocketProvider from "util/socketProvider";
import { useStateValue } from "store/state";
import Loader from 'components/Loader';

import "./index.scss";
import Messages from"./Messages";
import TextBox from "./TextBox";

export default () => {
  const { state } = useStateValue();

  let chatArea = (
    <Loader />
  );

  if (state.connected) {
    chatArea = (
      <>
        <Messages />
        <TextBox />
      </>
    );
  }

  return (
    <SocketProvider>
      <Container>
        { chatArea }
      </Container>
    </SocketProvider>
  );
};