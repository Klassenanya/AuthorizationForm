import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование панели действий с файлом: удалить', function () {

    beforeEach(function () {
        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForCopy.json'}).as('resources')
        cy.intercept('GET', '**/usage/', {fixture: 'usage.json'}).as('usage')
        cy.intercept('POST', '**/login').as('login')

        cy.loginUI('klassen', '1')
    })


    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')

    }


    function createKlassen1() {
        cy.get('[aria-label="klassen"]').should('exist').click()
        cy.get('#copy-button').should('contain', 'content_copy').click()
        cy.get('[aria-label="Копировать"]').click()
    }


    it('Удаление', () => {

        waits()
        createKlassen1()

        cy.intercept('DELETE', '**/resources/klassen(1)').as('delete')
        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForSwitch.json'}).as('resourcesNew')

        cy.get('[aria-label="klassen(1)"]').should('exist').click()
        cy.get('#delete-button').should('contain', 'delete').click()
        cy.get('[class="button button--flat button--red"]').click()

        cy.wait('@delete')
        cy.get('[aria-label="klassen(1)"]').should('not.exist')

        cy.wait('@resourcesNew')

    })


    it('Отмена удаления', () => {
        waits()

        cy.intercept({url: '**/resources/**'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.intercept({url: '**/resources/'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.get('[aria-label="klassen(1)"]').should('exist').click()
        cy.get('#delete-button').should('contain', 'delete').click()
        cy.get('[aria-label="Отмена"]').click()

        cy.get('[aria-label="klassen(1)"]').should('exist')

    })


    it('Ошибка 500', () => {

        waits()
        cy.intercept('DELETE', '**/resources/**', {statusCode: 500}).as('delete')

        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForCopy.json'}).as('resourcesNew')
        cy.get('[aria-label="klassen(1)"]').should('exist').click()
        cy.get('#delete-button').should('contain', 'delete').click()
        cy.get('[class="button button--flat button--red"]').click()

        cy.get('[aria-label="klassen(1)"]').should('exist')
        cy.get('.noty_buttons').should('contain', 'Сообщить о проблеме').and('contain', 'Закрыть')



    })


})
