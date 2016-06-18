import React from 'react';
import Relay from 'react-relay';
import MyRelayComponent from "./my-relay-component";

export default Relay.createContainer(
  MyRelayComponent,
  {
    fragments: {
      ship: () => Relay.QL`
        fragment on Ship {
          name
        }`,
    }
  }
);
