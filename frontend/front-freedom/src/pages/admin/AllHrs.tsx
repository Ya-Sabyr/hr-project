import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.service";
import { Trash2, Ban, Check, Unlock } from "lucide-react";
import Swal from "sweetalert2";

export default function AllHrs() {
  const [hrs, setHrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHrs();
  }, []);

  const fetchHrs = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getHrs();
      setHrs(response.data);
    } catch (err: any) {
      setError("Ошибка загрузки HR");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHr = async (hrId: string) => {
    const result = await Swal.fire({
      title: "Удалить hr?",
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
      await AdminService.deleteHr(hrId);
      setHrs(hrs.filter((hr) => hr.id !== hrId));
      Swal.fire("Удалено!", "HR был удален.", "success");
    } catch (err) {
      Swal.fire("Ошибка", "Не удалось удалить hr-a", "error");
    }
  };

  const handleApproveHR = async (hrId: string) => {
    try {
      await AdminService.approveHr(hrId);
      fetchHrs();
    } catch (err) {
      setError("Ошибка при одобрения hr");
    }
  };

  const handleToggleBlockHr = async (hrId: string) => {
    try {
      await AdminService.toggleBlockHr(hrId);
      fetchHrs();
    } catch (err) {
      setError("Ошибка блокировки/разблокировки hr");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Список HR</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Компания</th>
              <th className="border p-3">Email</th>
              <th className="border p-3">Статус</th>
              <th className="border p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {hrs.map((hr) => (
              <tr key={hr.id} className="text-center">
                <td className="border p-3">{hr.email}</td>
                <td className="border p-3">{hr.company || "Не указано"}</td>
                <td className="border p-3 font-bold">
                  {!hr.approved ? (
                    <span className="text-yellow-500">Ожидание</span>
                  ) : hr.blocked ? (
                    <span className="text-red-500">Заблокирован</span>
                  ) : (
                    <span className="text-green-500">Активен</span>
                  )}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  {!hr.approved && (
                    <button
                      onClick={() => handleApproveHR(hr.id)}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      <Check size={18} />
                    </button>
                  )}

                  {hr.approved && (
                    <button
                      onClick={() => handleToggleBlockHr(hr.id)}
                      className={`p-2 ${
                        hr.blocked
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white rounded`}
                    >
                      {hr.blocked ? <Unlock size={18}/> : <Ban size={18}/>}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteHr(hr.id)}
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
