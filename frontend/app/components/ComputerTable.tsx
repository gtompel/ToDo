'use client'
import { Computer } from '../page';

interface ComputerTableProps {
  computers: Computer[];
  onEdit: (computer: Computer) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, newStatus: string) => void;
}

const statuses = ['Не назначен', 'ОЖИДАНИЕ', 'В РАБОТЕ', 'ВЫПОЛНЕНО'];

const ComputerTable: React.FC<ComputerTableProps> = ({ computers, onEdit, onDelete, onUpdateStatus }) => {
  return (
    <table className="mt-6 w-full max-w-full">
      <thead>
        <tr className="bg-gray-300 text-black">
          <th className="p-2">Имя</th>
          <th className="p-2">Статус</th>
          <th className="p-2">Комментарий</th>
          <th className="p-2">Отдел</th>
          <th className="p-2">Назначено</th>
          <th className="p-2">Действия</th>
        </tr>
      </thead>
      <tbody>
        {computers.map((computer) => (
          <tr key={computer.id} className="bg-white text-black">
            <td className="p-2">{computer.name}</td>
            <td className="p-2">
              <select
                value={computer.status} 
                onChange={(e) => onUpdateStatus(computer.id, e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-2 py-1"
              >
                {statuses.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </td>
            <td className="p-2">{computer.comment}</td>
            <td className="p-2">{computer.department}</td>
            <td className="p-2">{computer.assignedTo}</td>
            <td className="p-2">
              <button onClick={() => onEdit(computer)} className="bg-gray-300 rounded-lg px-2 py-1 hover:bg-gray-400">Редактировать</button>
              <button onClick={() => onDelete(computer.id)} className="bg-red-500 text-white rounded-lg px-2 py-1 hover:bg-red-600 ml-2">Удалить</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ComputerTable;
