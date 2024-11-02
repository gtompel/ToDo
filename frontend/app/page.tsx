'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import ComputerForm from './components/ComputerForm';
import ComputerTable from './components/ComputerTable';

export interface Computer {
  id: number;
  name: string;
  status: string;
  comment?: string;
  department?: string;
  assignedTo?: string;
}

export interface ComputerInput {
  name: string;
  status: string;
  comment?: string;
  department?: string;
  assignedTo?: string;
}

const Home = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editComputer, setEditComputer] = useState<ComputerInput | null>(null);

  useEffect(() => {
    const fetchComputers = async () => {
      try {
        const response = await axios.get<Computer[]>('http://172.16.10.245:4200/computers');
        setComputers(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке компьютеров:", error);
      }
    };
    fetchComputers();
  }, []);

  const handleAddOrUpdateComputer = async (computerData: ComputerInput) => {
    if (editId) {
      try {
        const response = await axios.patch<Computer>(`http://172.16.10.245:4200/computers/${editId}`, computerData);
        setComputers((prev) => prev.map(comp => (comp.id === editId ? response.data : comp)));
        setEditId(null);
        setEditComputer(null); // Очистите данные редактирования
      } catch (error) {
        console.error("Ошибка при обновлении компьютера:", error);
      }
    } else {
      try {
        const response = await axios.post<Computer>('http://172.16.10.245:4200/computers', computerData);
        setComputers((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Ошибка при добавлении компьютера:", error);
      }
    }
  };

  const handleEdit = (computer: Computer) => {
    setEditId(computer.id);
    // Подготовьте данные для редактирования
    setEditComputer({
      name: computer.name,
      status: computer.status,
      comment: computer.comment || '',
      department: computer.department || '',
      assignedTo: computer.assignedTo || '',
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://172.16.10.245:4200/computers/${id}`);
      setComputers((prev) => prev.filter(comp => comp.id !== id));
    } catch (error) {
      console.error("Ошибка при удалении компьютера:", error);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://172.16.10.245:4200/computers/${id}`, { status: newStatus });
      setComputers((prev) => prev.map(comp => (comp.id === id ? { ...comp, status: newStatus } : comp)));
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Управление компьютерами</h1>
      <ComputerForm 
        onSubmit={handleAddOrUpdateComputer} 
        initialData={editComputer ?? undefined}  // Передаем данные для редактирования
        buttonText={editId ? "Обновить компьютер" : "Добавить компьютер"} 
      />
      <ComputerTable
        computers={computers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

export default Home;
