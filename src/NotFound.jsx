import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-lg mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
