import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import userEvent from "@testing-library/user-event";

test("renders TaskPage on root path", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText(/task manager/i)).toBeInTheDocument();
});

test("renders NotFound on unknown path", () => {
  render(
    <MemoryRouter initialEntries={["/random-page"]}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText(/not found/i)).toBeInTheDocument();
});

// Mock axios since it makes API calls
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() =>
    Promise.resolve({
      data: {
        id: "1",
        title: "Test",
        description: "Test Desc",
        completed: false,
      },
    }),
  ),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe("App Component", () => {
  test("renders task manager heading", () => {
    render(<App />);
    expect(screen.getByText(/task manager/i)).toBeInTheDocument();
  });

  test("shows validation errors for title with special characters", async () => {
    render(<App />);
    const titleInput = screen.getByPlaceholderText(/title/i);
    await userEvent.type(titleInput, "Task@123");
    expect(screen.getByText(/alphabets and numbers only/i)).toBeInTheDocument();
  });

  test("shows character count error if title < 5 chars", async () => {
    render(<App />);
    const titleInput = screen.getByPlaceholderText(/title/i);
    await userEvent.type(titleInput, "1234");
    expect(screen.getByText(/currently 4/i)).toBeInTheDocument();
  });

  test("disables submit button if form is invalid", async () => {
    render(<App />);
    const button = screen.getByRole("button", { name: /add task/i });
    expect(button).toBeDisabled();
  });

  test("can type valid title and description and enable button", async () => {
    render(<App />);
    const titleInput = screen.getByPlaceholderText(/title/i);
    const descInput = screen.getByPlaceholderText(/description/i);
    const button = screen.getByRole("button", { name: /add task/i });

    await userEvent.type(titleInput, "Valid Title");
    await userEvent.type(descInput, "Valid Description");

    expect(button).toBeEnabled();
  });
});
