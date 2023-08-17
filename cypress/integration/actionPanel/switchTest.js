import {mockRequests} from './mock'
import spok from 'cy-spok'

describe('Тестирование панели действий с файлом: вид', function () {

    beforeEach(function () {
        mockRequests()
        cy.intercept('PUT', '**/users/5', {fixture: 'switch.json'}).as('users')
        cy.loginUI('klassen', '1')
    })


    function waits() {
        cy.wait('@resources')
        cy.wait('@usage')
        cy.get('[aria-label="klassen"]').should('exist')
    }


    function checkIconAndFile(icon1, file1, icon2, file2, icon3, file3) {

        cy.get('[aria-label="Вид"] > .material-icons').then(el => {
            if (el.text() == icon1) {

                cy.get('[id="listing"]').should('have.class', file1 +' file-icons')

                cy.get('[aria-label="klassen"]').click()
                cy.get('[aria-label="Вид"]').click()

                cy.wait('@users').should (xhr => {
                    expect(xhr.request.body).to.contain('"viewMode":"' + file2 + '"')
                })

                cy.get('[aria-label="Вид"] > .material-icons').should('contain', icon2)
                cy.get('[id="listing"]').should('have.class', file2 + ' file-icons')
            }

            else {

                if (el.text() == icon2) {
                    cy.get('[id="listing"]').should('have.class', file2 +' file-icons')

                    cy.get('[aria-label="klassen"]').click()
                    cy.get('[aria-label="Вид"]').click()

                    cy.wait('@users').should (xhr => {
                        expect(xhr.request.body).to.contain('"viewMode":"' + file3 + '"')
                    })

                    cy.get('[aria-label="Вид"] > .material-icons').should('contain', icon3)
                    cy.get('[id="listing"]').should('have.class', file3 + ' file-icons')
                }

                else {
                    if (el.text() == icon3) {
                        cy.get('[id="listing"]').should('have.class', file3 +' file-icons')

                        cy.get('[aria-label="klassen"]').click()
                        cy.get('[aria-label="Вид"]').click()

                        cy.wait('@users').should (xhr => {
                            expect(xhr.request.body).to.contain('"viewMode":"' + file1 + '"')
                        })

                        cy.get('[aria-label="Вид"] > .material-icons').should('contain', icon1)
                        cy.get('[id="listing"]').should('have.class', file1 + ' file-icons')
                    }
                }
            }
        })
    }


    it('Проверка переключения иконок три раза подряд', () => {
        waits()
        checkIconAndFile('view_list', 'mosaic gallery', 'view_module', 'list', 'grid_view', 'mosaic')
        checkIconAndFile('view_module', 'list', 'grid_view', 'mosaic', 'view_list', 'mosaic gallery')
        checkIconAndFile('grid_view', 'mosaic', 'view_list', 'mosaic gallery', 'view_module', 'list')
    })


})





