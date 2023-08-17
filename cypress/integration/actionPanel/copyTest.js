import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование панели действий с файлом: копировать', function () {

    beforeEach(function () {
        mockRequests()
        cy.intercept('PATCH', '**/resources/**').as('copy')
        cy.loginUI('klassen', '1')
    })


    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')
        cy.get('[aria-label="klassen"]').should('exist').click()
    }


    function deleteKlassen1() {
        cy.get('[aria-label="klassen(1)"]').should('exist').click()
        cy.get('#delete-button').should('contain', 'delete').click()
        cy.get('[class="button button--flat button--red"]').click()
    }


    it('Копирование', () => {
        waits()

        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForCopy.json'}).as('resourcesNew')

        cy.get('#copy-button').should('contain', 'content_copy').click()
        cy.get('[aria-label="Копировать"]').click()

        cy.wait('@copy').its('request.url').should('include', 'action=copy&destination=%2Fklassen&override=false&rename=true')
        cy.get('[aria-label="klassen(1)"]').should('exist')

        cy.wait('@resourcesNew')

        deleteKlassen1()

    })


    it('Отмена копирования', () => {
        waits()

        cy.intercept({url: '**/resources/**'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.intercept({url: '**/resources/'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.get('#copy-button').should('contain', 'content_copy').click()
        cy.get('[aria-label="Отмена"]').click()

        cy.get('[aria-label="klassen(1)"]').should('not.exist')

    })


    it('Ошибка 500', () => {

        waits()
        cy.intercept('PATCH', '**/resources/**', {statusCode: 500}).as('copy')

        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForCopy.json'}).as('resourcesNew')
        cy.get('#copy-button').should('contain', 'content_copy').click()
        cy.get('[aria-label="Копировать"]').click()

        cy.get('[aria-label="klassen(1)"]').should('not.exist')
        cy.get('.noty_buttons').should('contain', 'Сообщить о проблеме').and('contain', 'Закрыть')

    })


})
