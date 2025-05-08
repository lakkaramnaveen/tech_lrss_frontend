import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import userEvent from "@testing-library/user-event";

// Mock axios since it makes API calls
jest.mock("axios", () => {
  return {
    get: jest.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "1",
            title: "Old",
            description: "Desc",
            completed: false,
          },
        ],
      }),
    ),
    post: jest.fn(() =>
      Promise.resolve({
        data: {
          id: "2",
          title: "Test Task",
          description: "Test Description",
          completed: false,
        },
      }),
    ),
    put: jest.fn(() =>
      Promise.resolve({
        data: {
          id: "1",
          title: "Updated",
          description: "Updated",
          completed: false,
        },
      }),
    ),
    patch: jest.fn(() =>
      Promise.resolve({
        data: {
          id: "1",
          title: "Old",
          description: "Desc",
          completed: true,
        },
      }),
    ),
    delete: jest.fn(() => Promise.resolve()),
  };
});

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

describe("App Component", () => {
  test("renders task manager heading", async () => {
    render(<App />);
    expect(await screen.findByText(/task manager/i)).toBeInTheDocument();
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

  test("adds a new task and displays it", async () => {
    render(<App />);
    const titleInput = screen.getByPlaceholderText(/title/i);
    const descInput = screen.getByPlaceholderText(/description/i);
    const button = screen.getByRole("button", { name: /add task/i });

    await userEvent.type(titleInput, "Test Task");
    await userEvent.type(descInput, "Test Description");
    await userEvent.click(button);

    expect(await screen.findByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  test("allows editing an existing task", async () => {
    render(<App />);
    expect(await screen.findByText("Old")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);

    const titleInput = screen.getByPlaceholderText(/title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated");

    const updateBtn = screen.getByRole("button", { name: /update task/i });
    await userEvent.click(updateBtn);

    expect(await screen.findByText("Updated")).toBeInTheDocument();
  });

  test("deletes a task", async () => {
    render(<App />);
    expect(await screen.findByText("Old")).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    await userEvent.click(deleteBtn);

    expect(screen.queryByText("Old")).not.toBeInTheDocument();
  });
});
