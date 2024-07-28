/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills"
import router from "../app/Router"


jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    test("Then bill icon in vertical layout should be highlighted", async () => {

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });

  });

  describe("When I am on NewBill Page and i choose a wrong filetype", () => {
    test("Then it should not be accepted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const file = new File(["dummy content"], "example.gif", {
        type: "image/gif",
      });


      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const newBill = new NewBill({
        document,
        onNavigate,
        store : mockStore,
        localStorage: window.localStorage,
      });

      newBill.handleChangeFile = jest.fn(newBill.handleChangeFile);
      
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener('change', newBill.handleChangeFile);

      fireEvent.change(inputFile, { target: { files: [file] } });
     
      expect(newBill.handleChangeFile).toHaveBeenCalled();
      await waitFor(() => screen.getByText("Seuls les fichiers .jpg, .jpeg et .png sont autorisés."));

      expect(screen.queryByText("Seuls les fichiers .jpg, .jpeg et .png sont autorisés.")).toBeTruthy();
    });
  });

  describe("When I am on NewBill Page and i choose a right filetype", () => {
    test("Then it should be accepted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      
      const file = new File(["dummy content"], "jpg.jpg", {
        type: "image/jpg",
      });
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      
      
      const newBill = new NewBill({
        document,
        onNavigate,
        store : mockStore,
        localStorage: window.localStorage,
      });
      
      newBill.handleChangeFile = jest.fn(newBill.handleChangeFile);
      
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener('change', newBill.handleChangeFile);
      
      
      fireEvent.change(inputFile, { target: { files: [file] } });

      
      expect(newBill.handleChangeFile).toHaveBeenCalled();      
      expect(inputFile.files[0].name).toBe("jpg.jpg");
      expect(screen.queryByText("Seuls les fichiers .jpg, .jpeg et .png sont autorisés.")).toBeNull();
      
    });
  });

  //POST TEST
  describe("When I am on NewBill Page and i fill all fields correctly", () => {
    
    test("It should create a new bill", async () => {

      const html = NewBillUI()
      document.body.innerHTML = html

      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
    
      const inputData = {
        type : "bill",
        expenseType: "Transports",
        expenseName: "Vol paris dubai",
        datepicker: "2024-07-05",
        amount: "500",
        vat: "50",
        pct: "250",
      };

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const selectExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(selectExpenseType, { target: { value: inputData.expenseType } });
      expect(selectExpenseType.value).toBe(inputData.expenseType);

      const inputExpenseName = screen.getByTestId("expense-name");
      fireEvent.change(inputExpenseName, { target: { value: inputData.expenseName } });
      expect(inputExpenseName.value).toBe(inputData.expenseName);

      const datepicker = screen.getByTestId("datepicker");
      fireEvent.change(datepicker, { target: { value: inputData.datepicker } });
      expect(datepicker.value).toBe(inputData.datepicker);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: inputData.amount } });
      expect(inputAmount.value).toBe(inputData.amount);

      const inputVat = screen.getByTestId("vat");
      fireEvent.change(inputVat, { target: { value: inputData.vat } });
      expect(inputVat.value).toBe(inputData.vat);

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, { target: { value: inputData.pct } });
      expect(inputPct.value).toBe(inputData.pct);

      const inputFile = screen.getByTestId("file");
      userEvent.upload(inputFile, file);
      expect(inputFile.files[0]).toStrictEqual(file);

      const form = screen.getByTestId("form-new-bill");

      const newBill = new NewBill({
        document,
        onNavigate,
        store : mockStore,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBill.updateBill = jest.fn(newBill.updateBill);
  
      const billsSpy = jest.spyOn(mockStore.bills(), "update")
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      
      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
      expect(billsSpy).toHaveBeenCalled();
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("post bill to API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);     
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    });

    test("post bill to API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    });
  });
 
})
