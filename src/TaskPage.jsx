import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API_URL = "http://localhost:8000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [titleError, setTitleError] = useState("");
  const [titleLengthError, setTitleLengthError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);

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
    if (!title.trim() || title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (!isValidTitle) {
      setError("Title must not contain special characters.");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError("Description must be at least 5 characters.");
      return;
    }

    try {
      if (editingId) {
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      alert("Failed to delete the task. Please try again.");
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await axios.patch(`${API_URL}/${task.id}`, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error(err);
      alert("Failed to update task status.");
    }
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
          <p className="text-red-500 text-sm mb-1">{titleError}</p>
        )}
        {titleLengthError && (
          <p className="text-red-500 text-sm mb-1">{titleLengthError}</p>
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
        {error && <p className="text-red-500 text-sm mb-1">{error}</p>}
        {descriptionError && (
          <p className="text-red-500 text-sm mb-1">{descriptionError}</p>
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

      {/* Select All & Bulk Delete Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedTasks.length === tasks.length && tasks.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedTasks(tasks.map((t) => t.id));
              } else {
                setSelectedTasks([]);
              }
            }}
            className="mr-2"
          />
          <label>Select All</label>
        </div>

        {selectedTasks.length > 0 && (
          <button
            onClick={async () => {
              const confirmed = window.confirm(
                `Delete ${selectedTasks.length} selected tasks?`,
              );
              if (!confirmed) return;

              try {
                await Promise.all(
                  selectedTasks.map((id) => axios.delete(`${API_URL}/${id}`)),
                );
                setTasks(tasks.filter((t) => !selectedTasks.includes(t.id)));
                setSelectedTasks([]);
              } catch (err) {
                alert("Failed to delete selected tasks.");
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Selected
          </button>
        )}
      </div>

      {/* Task List */}
      <div>
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded shadow mb-2 flex items-center"
          >
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTasks([...selectedTasks, task.id]);
                } else {
                  setSelectedTasks(
                    selectedTasks.filter((id) => id !== task.id),
                  );
                }
              }}
              className="mr-2"
            />

            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${
                  task.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h3>
              <p
                className={`text-gray-600 ${
                  task.completed ? "line-through text-gray-400" : ""
                }`}
              >
                {task.description}
              </p>
            </div>

            <button
              onClick={() => toggleComplete(task)}
              className={`text-sm px-3 py-1 rounded mr-2 font-semibold ${
                task.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {task.completed ? "Undo" : "Complete"}
            </button>

            <button
              onClick={() => startEditing(task)}
              className="text-blue-500 mr-2"
            >
              Edit
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
