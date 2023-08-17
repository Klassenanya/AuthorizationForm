import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование поисковой строки', function () {

    beforeEach(function () {
        mockRequests()
        cy.intercept('GET', '**/search/**', {fixture: 'search.json'}).as('search')
        cy.loginUI('admin', 'admin')
    })

    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')
    }

    function inputAndSearch(username, parameter) {
        cy.get('input[type="text"]').type(`${username}`+'{enter}')
        cy.wait('@search').its('request.url').should('include', parameter)
    }


    it('Проверка правильной передачи строки через параметры', () => {
        waits()
        inputAndSearch('klassen', 'query=klassen')
    })


    it('Проверка результатов поиска', () => {

        waits()
        inputAndSearch('klassen', '')
        cy.get('a[href="/files/klassen/"]').should('have.text', 'folder./klassen')
        cy.get('a[href="/files/klassen/klassen"]').should('have.text', 'insert_drive_file./klassen/klassen')
        cy.get('a[href="/files/klassen/"] > :nth-child(1)').should('have.text', 'folder')
        cy.get('a[href="/files/klassen/klassen"] > :nth-child(1)').should('have.text', 'insert_drive_file')

    })


    it('Проверка, что при передаче пустой строки запрос не передается', () => {

        cy.intercept({url: '**/search/**'}, (req) => { //отлов нежелательных запросов
            throw new Error('Caught unexpected request ' + req.url)
        }).as('unexpectedRequest')
        waits()
        cy.get('input[type="text"]').type('{enter}')

    })


    const testData = [
        {
            'value': 'Images',
            'query': 'image'
        },
        {
            'value': 'Music',
            'query': 'audio'
        },
        {
            'value': 'Video',
            'query': 'video'
        },
        {
            'value': 'PDF',
            'query': 'pdf'
        }
    ]


    testData.forEach((type) => {
        it('Проверка предлагаемых результатов с типом ' + type.value, () => {
            waits()
            cy.get('input[type="text"]').click()
            cy.get('[aria-label="' + type.value + '"]').click()
            inputAndSearch('', 'query=type%3A' + type.query + '%20')
        });
    })


    it('Проверка правильной отправки запроса', () => {
        cy.get('@login').its('request.body').should(
            spok(Cypress._.cloneDeep({
            'username':'admin',
            'password':'admin',
            'recaptcha':''
        })))
    })


    it('Проверка поиска с 500 ошибкой', () => {

        cy.intercept('GET', '**/search/**', {statusCode: 500}).as('search')
        waits()
        cy.get('input[type="text"]').type('klassen{enter}')
        cy.wait('@search').its('response.statusCode').should('equal', 500)
        cy.get('.noty_buttons').should('contain', 'Report Issue').and('contain', 'Close')

    })


    it('Проверка поиска с пустым json', () => {

        cy.intercept('GET', '**/search/**', {fixture: 'searchEmpty.json'}).as('search')
        waits()
        inputAndSearch('klassen', '')
        cy.get('@search').its('response.statusCode').should('equal', 200)
        cy.get('.noty_buttons').should('contain', 'Report Issue').and('contain', 'Close')

    })

})