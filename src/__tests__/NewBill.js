/**
 * @jest-environment jsdom
 */
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
    
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
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

  })

  describe("When I am on NewBill Page and i fill all fields correctly", () => {
    
    test("It should create a new bill in app", async () => {

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

      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = jest.fn();


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
        store,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      newBill.updateBill = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      // expect(window.localStorage.setItem).toHaveBeenCalledWith(
      //   "user",
      //   JSON.stringify({
      //     type : inputData.type,
      //     expenseType: inputData.expenseType,
      //     expenseName: inputData.expenseName,
      //     datepicker: inputData.datepicker,
      //     amount: inputData.amount,
      //     vat: inputData.vat,
      //     pct: inputData.pct,
      //   })
      // );

      // expect(screen.queryByText("Vol paris dubai")).toBeTruthy();
    });

    test("It should renders Bills page", () => {
      expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
    })
  })
 
})
