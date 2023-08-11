Cypress.Commands.add('login', (username, password)=> {
    Cypress.log({
        name: 'login',
        message: `${username} | ${password}`
    })

//    cy.visit('/')
    cy.get('[type="text"]').type(`${username}`)
    cy.get('[type="password"]').type(`${password}`)
    cy.contains('Войти').click()
//    cy.get('.button').click
})
