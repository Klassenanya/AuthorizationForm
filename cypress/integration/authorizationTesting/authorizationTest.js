import {mockRequests} from './mock'
import spok from 'cy-spok'

context('Заполнение и отправка формы на странице', function () {

    beforeEach(function () {
        cy.intercept('POST', '**/login').as('login')
        cy.visit('/')
    })

    it('fillAuthorizationFormPositive', () => {
        cy.login('admin', 'admin')

        cy.wait('@login').should(xhr => {
            expect(xhr.request.body).have.property('password', 'admin')
            expect(xhr.request.body).have.property('username', 'admin')
        })

        cy.url().should('eq', 'http://51.250.1.158:49153/files/')
    })


    it('fillAuthorizationFormNegative', () => {
        cy.login('name', 'pwd')

        cy.wait('@login').should (xhr => {
            expect(xhr.request.body).have.property('username', 'name')
            expect(xhr.request.body).have.property('password', 'pwd')

            expect(xhr.response.body).to.contain('403 Forbidden')
        })

//            cy.wait('@login').its('response.statusCode').should('equal', 403)

        cy.get('.wrong').should('have.text', 'Неверные данные')
    })


    it('fillAuthorizationFormNegativeEmpty', () => {
        cy.get('[type="text"]').clear()
        cy.get('[type="password"]').clear()

        cy.contains('Войти').click()

        cy.wait('@login').should (xhr => {
            expect(xhr.request.body).have.property('username', '')
            expect(xhr.request.body).have.property('password', '')

            expect(xhr.response.body).to.contain('403 Forbidden')
        })

//            cy.wait('@login').its('response.statusCode').should('equal', 403)

            cy.get('.wrong').should('have.text', 'Неверные данные')
    })

})