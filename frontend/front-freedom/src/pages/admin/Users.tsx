import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.service";
import { Trash2, Ban, Unlock } from "lucide-react";
import Swal from "sweetalert2";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Удалить пользователя?",
      text: "Это действие нельзя отменить!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Да",
      cancelButtonText: "Отмена",
    });

    if (!result.isConfirmed) return;

    try {
      await AdminService.deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      Swal.fire("Удалено!", "Пользователь был удален.", "success");
      //      fetchUsers();
    } catch (err) {
      Swal.fire("Ошибка", "Не удалось удалить пользователя", "error");
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      await AdminService.toggleBlockUser(userId);
      fetchUsers();
      /*     setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        )
      ); */
    } catch (err: any) {
      setError("Ошибка блокировки/разблокировки пользователя");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список пользователей</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Email</th>
              <th className="border p-3">Статус</th>
              <th className="border p-3">Действие</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border p-3">{user.email}</td>

                <td className="border p-3">
                  <span
                    className={`px-2 py-1 rounded ${
                      user.blocked
                        ? "bg-red-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {user.blocked ? "Заблокирован" : "Активен"}
                  </span>
                </td>

                <td className="border p-2 flex justify-center gap-2">
                  <button
                    onClick={() => handleToggleBlock(user.id)}
                    className={`p-2  ${
                      user.blocked
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white rounded`}
                  >
                    {user.blocked ? <Unlock size={18}/> : <Ban size={18} />}
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 bg-gray-400 text-white rounded hover:bg-gray-600"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
