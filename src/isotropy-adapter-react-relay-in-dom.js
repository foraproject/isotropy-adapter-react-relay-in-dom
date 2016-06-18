/* @flow */
import React from "react";
import ReactDOM from "react-dom";
import IsomorphicRelay from 'isomorphic-relay';
import Relay from 'react-relay';


export type RenderArgsType = {
  Component: Function,
  args: Object,
  elementSelector: string,
  dataSelector: string,
  onRender?: Function
};

export type RenderRelayContainerArgsType = {
  Container: Function,
  RelayRoute: Function,
  args: Object,
  graphqlUrl: string,
  elementSelector: string,
  dataSelector: string,
  onRender?: Function
};

const render = async function(params: RenderArgsType) : Promise {
  const { Component, args, elementSelector, onRender } = params;
  const domNode = document.querySelector(elementSelector);
  const reactElement = React.createElement(Component, args);
  if (onRender) {
    onRender(reactElement);
  } else {
    ReactDOM.render(reactElement, domNode);
  }
};


const renderRelayContainer = async function(params: RenderRelayContainerArgsType) : Promise {
  const { Container, RelayRoute, args, graphqlUrl, elementSelector, dataSelector, onRender } = params;

  const rootContainerProps = {
    Container: Container,
    queryConfig: new RelayRoute(args)
  };

  const environment = new Relay.Environment();
  if (graphqlUrl) {
    environment.injectNetworkLayer(new Relay.DefaultNetworkLayer(graphqlUrl));
  }

  const dataNode = document.querySelector(dataSelector);
  if (dataNode) {
    const data = JSON.parse(dataNode.textContent);
    IsomorphicRelay.injectPreparedData(environment, data);
  }

  const domNode = document.querySelector(elementSelector);
  const props = await IsomorphicRelay.prepareInitialRender({ ...rootContainerProps, environment });
  const relayElement = <IsomorphicRelay.Renderer {...props} />;
  if (onRender) {
    onRender(relayElement);
  } else {
    ReactDOM.render(relayElement, domNode);
  }
};


export default {
  render,
  renderRelayContainer
};
