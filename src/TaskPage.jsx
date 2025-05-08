import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL = "http://localhost:8000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [titleLengthError, setTitleLengthError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const isValidTitle = /^[a-zA-Z0-9 ]+$/.test(title.trim());
  const isFormValid =
    title.trim().length >= 5 &&
    title.trim().length <= 500 &&
    description.trim().length >= 5 &&
    description.trim().length <= 500 &&
    isValidTitle &&
    !titleError &&
    !titleLengthError &&
    !descriptionError;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API_URL);
    setTasks(res.data);
  };

  const addOrUpdateTask = async () => {
    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (!isValidTitle) {
      setError("Title must not contain special characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 3) {
      setError("Description must be at least 3 characters.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        const res = await axios.put(`${API_URL}/${editingId}`, {
          id: editingId,
          title,
          description,
          completed: tasks.find((t) => t.id === editingId)?.completed || false,
        });
        setTasks(
          tasks.map((task) => (task.id === editingId ? res.data : task)),
        );
        setEditingId(null);
      } else {
        // ADD
        const res = await axios.post(API_URL, {
          id: "",
          title,
          description,
          completed: false,
        });
        setTasks([...tasks, res.data]);
      }

      setTitle("");
      setDescription("");
      setError("");
    } catch (err) {
      setError("Failed to save task. Try again.");
    }
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTask = async (id) => {
    const res = await axios.patch(`${API_URL}/${id}/toggle`);
    setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
  };

  const startEditing = (task) => {
    setTitle(task.title);
    setDescription(task.description);
    setEditingId(task.id);
    setError("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Task Manager {editingId ? "(Editing)" : ""}
      </h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            const value = e.target.value;
            setTitle(value);

            if (value.trim().length > 0 && !/^[a-zA-Z0-9 ]*$/.test(value)) {
              setTitleError("Enter alphabets and numbers only");
            } else {
              setTitleError("");
            }

            const len = value.trim().length;
            if (len > 0 && (len < 5 || len > 500)) {
              setTitleLengthError(`Enter 5-500 characters (currently ${len})`);
            } else {
              setTitleLengthError("");
            }
          }}
          placeholder="Title"
          className="w-full p-2 border mb-1 rounded"
        />
        {titleError && (
          <p className="text-red-500 text-sm mb-2">{titleError}</p>
        )}
        {titleLengthError && (
          <p className="text-red-500 text-sm mb-2">{titleLengthError}</p>
        )}
        <textarea
          value={description}
          onChange={(e) => {
            const value = e.target.value;
            setDescription(value);

            const len = value.trim().length;
            if (len > 0 && (len < 5 || len > 500)) {
              setDescriptionError(`Enter 5-500 characters (currently ${len})`);
            } else {
              setDescriptionError("");
            }
          }}
          placeholder="Description"
          className="w-full p-2 border mb-2 rounded"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {descriptionError && (
          <p className="text-red-500 text-sm mb-2">{descriptionError}</p>
        )}
        <button
          onClick={addOrUpdateTask}
          className={`w-full px-4 py-2 rounded text-white transition ${
            isFormValid
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isFormValid}
        >
          {editingId ? "Update Task" : "Add Task"}
        </button>
      </div>

      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex justify-between items-center bg-gray-100 p-3 mb-2 rounded shadow"
          >
            <div>
              <h2
                className={`text-xl font-semibold ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h2>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleTask(task.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                {task.completed ? "Undo" : "Complete"}
              </button>
              <button
                onClick={() => startEditing(task)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
