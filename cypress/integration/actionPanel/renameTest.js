import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование панели действий с файлом: переименовать', function () {

    beforeEach(function () {
        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForSwitch.json'}).as('resources')
        cy.intercept('GET', '**/usage/', {fixture: 'usage.json'}).as('usage')
        cy.intercept('POST', '**/login').as('login')
        cy.intercept('PATCH', '**/resources/**').as('rename')
        cy.loginUI('klassen', '1')
    })


    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')
        cy.get('[aria-label="klassen"]').should('exist').click()
    }


    function renameHelloBack() {
        cy.get('[aria-label="hello"]').should('exist').click()
        cy.get('[aria-label="Переименовать"]').click()
        cy.get('.input').clear().type('klassen')
        cy.get('[type="submit"]').click()
    }


    it('Переименование', () => {
        waits()

        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForRename.json'}).as('resourcesNew')

        cy.get('[aria-label="Переименовать"]').click()
        cy.get('.input').clear().type('hello')
        cy.get('[type="submit"]').click()

        cy.wait('@rename').its('request.url').should('include', 'action=rename&destination=%2Fhello&override=false&rename=false')
        cy.get('[aria-label="hello"]').should('exist')

        cy.wait('@resourcesNew')

        renameHelloBack()

    })


    it('Отмена переименования', () => {
        waits()

        cy.intercept({url: '**/resources/**'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.intercept({url: '**/resources/'}, (req) => { //отлов нежелательных запросов
                    throw new Error('Caught unexpected request ' + req.url)
                }).as('unexpectedRequest')

        cy.get('[aria-label="Переименовать"]').click()
        cy.get('[aria-label="Отмена"]').click()

        cy.get('[aria-label="klassen"]').should('exist')

    })


    it('Ошибка 500', () => {

        waits()
        cy.intercept('PATCH', '**/resources/**', {statusCode: 500}).as('rename')

        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForSwitch.json'}).as('resourcesNew')

        cy.get('[aria-label="Переименовать"]').click()
        cy.get('.input').clear().type('hello')
        cy.get('[type="submit"]').click()

        cy.get('[aria-label="hello"]').should('not.exist')
        cy.get('.noty_buttons').should('contain', 'Сообщить о проблеме').and('contain', 'Закрыть')

    })


})
