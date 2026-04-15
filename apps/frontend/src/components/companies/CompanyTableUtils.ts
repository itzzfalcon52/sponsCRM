// utils
export const getStatusColor = (status: string) => {
    switch (status) {
      case "IN_TALKS":
        return "bg-blue-100 text-blue-700";
      case "NEGOTIATING":
        return "bg-yellow-100 text-yellow-700";
      case "CLOSED":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };