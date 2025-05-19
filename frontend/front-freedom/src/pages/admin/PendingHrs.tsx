import { useEffect, useState } from "react";
import { AdminService } from "../../services/admin.service";
import { Check } from "lucide-react";

export default function PendingHrs() {
  const [pendingHrs, setPendingHrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingHrs();
  }, []);

  const fetchPendingHrs = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getPendingHrs();
      setPendingHrs(response.data);
    } catch (err: any) {
      setError("Ошибка загрузки HR");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveHR = async (hrId: string) => {
    try {
      await AdminService.approveHr(hrId);
      fetchPendingHrs();
    } catch (err) {
      setError("Ошибка при одобрении hr");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ожидающие HR</h2>
      {error && <p className="text-red-500">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Email</th>
              <th className="border p-3">Компания</th>
              <th className="border p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {pendingHrs.map((hr) => (
              <tr key={hr.id} className="text-center">
                <td className="border p-3">{hr.email}</td>
                <td className="border p-3">{hr.company || "Не указано"}</td>
                <td className="border p-3 flex justify-center gap-2">
                  <button
                    onClick={() => handleApproveHR(hr.id)}
                    className="p-1 bg-green-500 text-white rounded"
                  >
                    <Check size={18}/>
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
