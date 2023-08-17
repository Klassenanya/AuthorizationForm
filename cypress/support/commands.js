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


Cypress.Commands.add("loginUI", (username, password) => {
    cy.visit('/login')
    cy.get('input[type="text"]').type(username)
    cy.get('input[type="password"]').type(password)
    cy.get('input[type="submit"]').click()
    cy.wait('@login')
})

Cypress.Commands.add('logout', () => {
    cy.get('#logout').click()
})
