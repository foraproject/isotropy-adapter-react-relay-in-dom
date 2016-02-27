import __polyfill from "babel-polyfill";
import setupJSDOM from "./__jsdom_setup";
import React from "react";
import ReactDOM from "react-dom";
import should from 'should';
import jsdom from 'jsdom';
import fetch from "isomorphic-fetch";
import adapter from "../isotropy-adapter-react-relay-in-dom";
import schema from "./my-schema";
import MyComponent from "./my-component";
import MyRelayContainer from "./my-relay-container";
import MyRelayRoute from "./my-relay-route";

//For now the GraphQL server is going to run as a separate process.
import express from 'express';
import graphQLHTTP from 'express-graphql';

// isomorphic-relay must be loaded before react-relay (happens in isotropy-adapter-react)
// or you get "self is not defined"
// https://github.com/denvned/isomorphic-relay/commit/5a7b673250bd338f3333d00075336ffcc73be806
import Relay from "react-relay";


describe("Isotropy browser adapter for React (incomplete tests)", () => {

  before(() => {
    // Expose a GraphQL endpoint
    const app = express();
    app.use('/graphql', graphQLHTTP({schema, pretty: true}));
    app.listen(8080);
  });


  it(`Renders a React UI`, () => {
    setupJSDOM();
    const component = MyComponent;
    const context = {};

    adapter.render({
      component,
      args: { name: "Jeswin"},
      context,
      elementSelector: "#isotropy-container"
    });
    document.querySelector("body").innerHTML.should.containEql(`Jeswin`);
  });


  it(`Calls onRender`, () => {
    setupJSDOM();
    const component = MyComponent;
    const context = {};
    let onRenderCalled = false;

    adapter.render({
      component,
      args: { name: "Jeswin"},
      context,
      onRender: function() {
        onRenderCalled = true;
      }
    });
    onRenderCalled.should.be.true();
  });

  it(`Serves a Relay Component`, () => {
    setupJSDOM();
    const relayContainer = MyRelayContainer;
    const context = {};

    return new Promise((resolve, reject) => {
      const graphqlUrl = `http://localhost:8080/graphql`;
      window.onDataLoad = () => {
        document.querySelector("body").innerHTML.should.containEql("ENTERPRISE");
        resolve();
      };
      adapter.renderRelayContainer({
        relayContainer,
        relayRoute: MyRelayRoute,
        args: { id: "200" },
        context,
        graphqlUrl,
        elementSelector: "#isotropy-container"
      });
    });
  });

  it(`Calls onRender for a Relay Component`, () => {
    setupJSDOM();
    const relayContainer = MyRelayContainer;
    const context = {};
    let onRenderCalled = false;
    
    return new Promise((resolve, reject) => {
      const graphqlUrl = `http://localhost:8080/graphql`;
      window.onDataLoad = () => {
        onRenderCalled.should.be.true();
        resolve();
      };
      adapter.renderRelayContainer({
        relayContainer,
        relayRoute: MyRelayRoute,
        args: { id: "200" },
        context,
        graphqlUrl,
        onRender: function(relayElement) {
          onRenderCalled = true;
          const domNode = document.querySelector("#isotropy-container");
          ReactDOM.render(relayElement, domNode);
        }
      });
    });
  });
});
