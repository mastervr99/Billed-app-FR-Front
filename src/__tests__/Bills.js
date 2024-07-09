/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

  })
    
  //******************************************************** */
  describe('When I am on Bills Page and I click on the button to add a bill', () => {
    test("It should renders New Bill page", async () => {

      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }
      
      const store = jest.fn();
      
      const displayed_bills = new Bills({document, onNavigate, store, localStorageMock})
      
      document.body.innerHTML = BillsUI({ data: bills });

      const createNewBillButton =  screen.getByTestId("btn-new-bill");

      const handleClickNewBill = jest.fn((e) => displayed_bills.handleClickNewBill);

      createNewBillButton.addEventListener('click', handleClickNewBill);

      userEvent.click(createNewBillButton);

      expect(handleClickNewBill).toHaveBeenCalled();

      document.body.innerHTML = NewBillUI();

      await waitFor(() => screen.getAllByText("Envoyer une note de frais") );

      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  })

  describe('When I am on Bills Page and I click on the icon eye', () => {
    test('A modal should open', () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = jest.fn();
      
      document.body.innerHTML = BillsUI({ data: bills });
      const displayed_bills = new Bills({document, onNavigate, store, localStorageMock})

      const iconEye = screen.getAllByTestId('icon-eye')

      const handleClickIconEye = jest.fn(displayed_bills.handleClickIconEye(iconEye[0]))
      
      
      iconEye[0].addEventListener('click', handleClickIconEye)
      userEvent.click(iconEye[0])
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getAllByText('Justificatif')
      expect(modale).toBeTruthy()

    })
  })

   //******************************************************** */

  // test d'intégration GET
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getAllByText("En attente")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getAllByText("Refused")
      expect(contentRefused).toBeTruthy()
    })
  })
})
