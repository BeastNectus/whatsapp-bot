"use client";
import { useEffect, useState } from "react";
import { FaEnvelope, FaShoppingCart, FaBoxOpen, FaMoon, FaSun, FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function AdminDashboard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(true); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Separate pagination states for each section
  const [messagesPage, setMessagesPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);

  const [itemsPerPage] = useState(5);

  // Pagination logic for messages
  const messagesIndexOfLastItem = messagesPage * itemsPerPage;
  const messagesIndexOfFirstItem = messagesIndexOfLastItem - itemsPerPage;
  const currentMessages = messages.slice(messagesIndexOfFirstItem, messagesIndexOfLastItem);
  const messagesTotalPages = Math.ceil(messages.length / itemsPerPage);

  // Pagination logic for orders
  const ordersIndexOfLastItem = ordersPage * itemsPerPage;
  const ordersIndexOfFirstItem = ordersIndexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(ordersIndexOfFirstItem, ordersIndexOfLastItem);
  const ordersTotalPages = Math.ceil(orders.length / itemsPerPage);

  // Pagination logic for inventory
  const inventoryIndexOfLastItem = inventoryPage * itemsPerPage;
  const inventoryIndexOfFirstItem = inventoryIndexOfLastItem - itemsPerPage;
  const currentInventory = inventory.slice(inventoryIndexOfFirstItem, inventoryIndexOfLastItem);
  const inventoryTotalPages = Math.ceil(inventory.length / itemsPerPage);

  useEffect(() => {
    // Fetch messages
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data));

    // Fetch orders
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));

    // Fetch inventory
    fetch("/api/admin/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data));
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 p-6 ${darkMode ? "bg-gray-900" : "bg-white"} border-r ${
          darkMode ? "border-gray-800" : "border-gray-200"
        } transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } z-20`}
      >
        {/* Arrow Button to Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute -right-4 top-1/2 transform -translate-y-1/2 p-2 ${
            darkMode ? "bg-gray-900 text-teal-400" : "bg-white text-teal-600"
          } rounded-full shadow-lg hover:bg-teal-500 hover:text-white transition-all duration-200 ease-in-out border ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          {sidebarOpen ? <FaArrowLeft className="text-xl" /> : <FaArrowRight className="text-xl" />}
        </button>

        <h1 className="text-2xl font-bold mb-8 text-teal-400">Admin Panel</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <a
                href="#messages"
                className={`flex items-center ${darkMode ? "text-gray-300 hover:text-teal-400" : "text-gray-700 hover:text-teal-600"} transition-colors`}
              >
                <FaEnvelope className="mr-2" /> Messages
              </a>
            </li>
            <li>
              <a
                href="#orders"
                className={`flex items-center ${darkMode ? "text-gray-300 hover:text-teal-400" : "text-gray-700 hover:text-teal-600"} transition-colors`}
              >
                <FaShoppingCart className="mr-2" /> Orders
              </a>
            </li>
            <li>
              <a
                href="#inventory"
                className={`flex items-center ${darkMode ? "text-gray-300 hover:text-teal-400" : "text-gray-700 hover:text-teal-600"} transition-colors`}
              >
                <FaBoxOpen className="mr-2" /> Inventory
              </a>
            </li>
          </ul>
        </nav>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`mt-8 w-full py-2 rounded-lg flex items-center justify-center ${
            darkMode ? "bg-teal-600 hover:bg-teal-500" : "bg-teal-500 hover:bg-teal-400"
          } text-white transition-colors`}
        >
          {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Main Content */}
      <div
        className={`p-4 lg:p-8 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <h1 className="text-3xl font-bold mb-8 text-teal-400">Dashboard Overview</h1>

        {/* Messages Section */}
        <section id="messages" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-teal-400">
            <FaEnvelope className="mr-2" /> Customer Messages
          </h2>
          <div
            className={`rounded-lg shadow-lg ${darkMode ? "bg-gray-900" : "bg-white"} border ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } overflow-x-auto`}
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className={`border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                  <th className="p-4 text-left text-teal-400">From</th>
                  <th className="p-4 text-left text-teal-400">Message</th>
                  <th className="p-4 text-left text-teal-400">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentMessages.map((message) => (
                  <tr
                    key={message._id}
                    className={`border-b ${darkMode ? "border-gray-800 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="p-4">{message.senderId}</td>
                    <td className="p-4">{message.message}</td>
                    <td className="p-4">{new Date(message.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls for Messages */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setMessagesPage(messagesPage - 1)}
              disabled={messagesPage === 1}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${messagesPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            {Array.from({ length: messagesTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setMessagesPage(i + 1)}
                className={`mx-1 px-4 py-2 rounded-lg ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
                } ${messagesPage === i + 1 ? "bg-teal-500 text-white" : "hover:bg-teal-500 hover:text-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setMessagesPage(messagesPage + 1)}
              disabled={messagesPage === messagesTotalPages}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${messagesPage === messagesTotalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        </section>

        {/* Orders Section */}
        <section id="orders" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-teal-400">
            <FaShoppingCart className="mr-2" /> Orders
          </h2>
          <div
            className={`rounded-lg shadow-lg ${darkMode ? "bg-gray-900" : "bg-white"} border ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } overflow-x-auto`}
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className={`border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                  <th className="p-4 text-left text-teal-400">User ID</th>
                  <th className="p-4 text-left text-teal-400">Item</th>
                  <th className="p-4 text-left text-teal-400">Quantity</th>
                  <th className="p-4 text-left text-teal-400">Total Amount</th>
                  <th className="p-4 text-left text-teal-400">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`border-b ${darkMode ? "border-gray-800 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="p-4">{order.userId}</td>
                    <td className="p-4">{order.item}</td>
                    <td className="p-4">{order.quantity}</td>
                    <td className="p-4">${order.totalAmount}</td>
                    <td className="p-4">{new Date(order.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls for Orders */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setOrdersPage(ordersPage - 1)}
              disabled={ordersPage === 1}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${ordersPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            {Array.from({ length: ordersTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setOrdersPage(i + 1)}
                className={`mx-1 px-4 py-2 rounded-lg ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
                } ${ordersPage === i + 1 ? "bg-teal-500 text-white" : "hover:bg-teal-500 hover:text-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setOrdersPage(ordersPage + 1)}
              disabled={ordersPage === ordersTotalPages}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${ordersPage === ordersTotalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        </section>

        {/* Inventory Section */}
        <section id="inventory">
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-teal-400">
            <FaBoxOpen className="mr-2" /> Inventory
          </h2>
          <div
            className={`rounded-lg shadow-lg ${darkMode ? "bg-gray-900" : "bg-white"} border ${
              darkMode ? "border-gray-800" : "border-gray-200"
            } overflow-x-auto`}
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className={`border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
                  <th className="p-4 text-left text-teal-400">Item</th>
                  <th className="p-4 text-left text-teal-400">Stock</th>
                  <th className="p-4 text-left text-teal-400">Price</th>
                </tr>
              </thead>
              <tbody>
                {currentInventory.map((item) => (
                  <tr
                    key={item._id}
                    className={`border-b ${darkMode ? "border-gray-800 hover:bg-gray-800" : "border-gray-200 hover:bg-gray-50"} transition-colors`}
                  >
                    <td className="p-4">{item.item}</td>
                    <td className="p-4">{item.stock}</td>
                    <td className="p-4">${item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls for Inventory */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setInventoryPage(inventoryPage - 1)}
              disabled={inventoryPage === 1}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${inventoryPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            {Array.from({ length: inventoryTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setInventoryPage(i + 1)}
                className={`mx-1 px-4 py-2 rounded-lg ${
                  darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
                } ${inventoryPage === i + 1 ? "bg-teal-500 text-white" : "hover:bg-teal-500 hover:text-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setInventoryPage(inventoryPage + 1)}
              disabled={inventoryPage === inventoryTotalPages}
              className={`mx-1 px-4 py-2 rounded-lg ${
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-900"
              } ${inventoryPage === inventoryTotalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-500 hover:text-white"}`}
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}