/* eslint-disable spaced-comment */
/// <reference types="cypress" />

describe("화면 테스트", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/");
  });

  it("Text Box와 버튼이 잘 보이는지", () => {
    cy.get(".moz-button-login").should("be.visible");
    cy.get(".moz-button-login").should("contain.text", "Login");
  });
});
