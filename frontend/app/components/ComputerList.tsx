import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComputerForm from './ComputerForm';
import ComputerTable from './ComputerTable';
import { Computer, ComputerInput } from './types';
const ComputerList = () => {


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
    <>
      <ComputerForm 
        onSubmit={handleAddOrUpdateComputer} 
        initialData={editComputer ?? undefined} 
        buttonText={editId ? "Обновить компьютер" : "Добавить компьютер"} 
      />
      <ComputerTable
        computers={computers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
    </>
  );
}

export default ComputerList;