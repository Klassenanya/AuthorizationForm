import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование панели действий с файлом: копировать', function () {

    beforeEach(function () {
        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForSwitch.json'}).as('resources')
        cy.intercept('GET', '**/usage/', {fixture: 'usage.json'}).as('usage')
        cy.intercept('POST', '**/login').as('login')
        cy.intercept('PATCH', '**/resources/klassen**').as('resourcesKlassen')
        cy.loginUI('klassen', '1')
    })


    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')
    }

    function newFolder() {

        cy.intercept('GET', '**/usage/', {fixture: 'usage2.json'}).as('usage2')
        cy.intercept('GET', '**/resources/', {fixture: 'resourcesForMoveBefore.json'}).as('moveBefore')

        cy.get('[aria-label="Новый каталог"]').click()
        cy.get('.input').type('MoveFolder')
        cy.get('[aria-label="Создать"]').click()

        cy.get('[aria-label="Файлы"]').click()

        cy.wait('@usage2')
        cy.wait('@moveBefore')

        cy.get('[aria-label="MoveFolder"]').should('exist')
        cy.get('[aria-label="klassen"]').should('exist').click()
    }


    function moveFileBack() {
        cy.get('[aria-label="Файлы"]').click()
        cy.get('[aria-label="MoveFolder"]').dblclick()
        cy.get('[aria-label="klassen"]').click()
        cy.get('#move-button').click()
        cy.get('li').click() // директория files
        cy.get('[aria-label="Переместить"]').click()

    }


    function deleteMoveFolder() {
        cy.get('[aria-label="Файлы"]').click()
        cy.get('[aria-label="MoveFolder"]').click()
        cy.get('#delete-button').should('contain', 'delete').click()
        cy.get('[class="button button--flat button--red"]').click()

    }


    it('Перемещение', () => {

        waits()
        newFolder()

        cy.get('#move-button').click()
        cy.get('li').click() // директория MyFolder

        cy.intercept('GET', '**/resources/MoveFolder/', {fixture: 'resourcesMoveFolder.json'}).as('moveFolder')

        cy.get('[aria-label="Переместить"]').click()
        cy.intercept('GET', '**/resources/MoveFolder/', {fixture: 'resourcesForMoveAfterFolder.json'}).as('moveAfterFolder')

        cy.wait('@moveFolder')
        cy.wait('@resourcesKlassen')
        cy.wait('@moveAfterFolder')
        cy.get('[aria-label="klassen"]').should('exist').click()


        cy.intercept('GET', '**/resources/', {fixture: 'resourcesOnlyMoveFolder.json'}).as('resourcesNew')
        cy.get('[aria-label="Файлы"]').click()

        cy.wait('@resourcesNew')
        cy.get('[aria-label="MoveFolder"]').should('exist')
        cy.get('[aria-label="klassen"]').should('not.exist')

        // перемещение файла klassen обратно и удаление папки MoveFolder
        moveFileBack()
        deleteMoveFolder()

    })


    // Негативный тест, падает, тк кнопка "Переместить" недоступна без выбора директории
    // Если кнопка станет доступна, нежелательный запрос будет отправлен и отловлен
    it('Перемещение без выбора директории', () => {

        waits()
        newFolder()

        cy.intercept({url: '**/resources/MoveFolder/'}, (req) => { //отлов нежелательных запросов
            throw new Error('Caught unexpected request ' + req.url)
        }).as('unexpectedRequest')

        cy.intercept({url: '**/resources/'}, (req) => { //отлов нежелательных запросов
            throw new Error('Caught unexpected request ' + req.url)
        }).as('unexpectedRequest')

        cy.get('#move-button').click()

        cy.get('[aria-label="Переместить"]').click()

    })


    it('Отмена перемещения', () => {

        waits()
        newFolder()

        cy.intercept({url: '**/resources/MoveFolder/'}, (req) => { //отлов нежелательных запросов
            throw new Error('Caught unexpected request ' + req.url)
        }).as('unexpectedRequest')

        cy.intercept({url: '**/resources/'}, (req) => { //отлов нежелательных запросов
            throw new Error('Caught unexpected request ' + req.url)
        }).as('unexpectedRequest')

        cy.get('#move-button').click()
        cy.get('[aria-label="Отмена"]').click()

    })


    it('Ошибка 500', () => {

        waits()
        newFolder()

        cy.intercept('PATCH', '**/resources/klassen**', {statusCode: 500}).as('resourcesKlassen')

        cy.get('#move-button').click()
        cy.get('li').click() // директория MyFolder
        cy.get('[aria-label="Переместить"]').click()

        cy.get('[aria-label="klassen"]').should('exist')

        cy.get('.noty_buttons').should('contain', 'Сообщить о проблеме').and('contain', 'Закрыть')

        // удаление папки MoveFolder
        cy.contains('Закрыть').click()
        cy.get('[aria-label="Отмена"]').click()
        deleteMoveFolder()

    })


})
