'use client'
import { useState, useEffect } from 'react';

interface ComputerInput {
  name: string;
  status: string;
  comment?: string;
  department?: string;
  assignedTo?: string;
}

interface ComputerFormProps {
  onSubmit: (data: ComputerInput) => void;
  initialData?: ComputerInput; // Новый параметр для первоначальных данных
  buttonText: string;
}

const statuses = ['Не назначен', 'ОЖИДАНИЕ', 'В РАБОТЕ', 'ВЫПОЛНЕНО'];

const ComputerForm: React.FC<ComputerFormProps> = ({ onSubmit, initialData, buttonText }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Не назначен');
  const [comment, setComment] = useState('');
  const [department, setDepartment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Используйте effect для инициализации полей при редактировании
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setComment(initialData.comment || '');
      setDepartment(initialData.department || '');
      setAssignedTo(initialData.assignedTo || '');
    } else {
      // Сбросьте поля, когда initialData отсутствует
      setName('');
      setStatus('Не назначен');
      setComment('');
      setDepartment('');
      setAssignedTo('');
    }
  }, [initialData]);

  const handleSubmit = () => {
    const computerData = { name, status, comment, department, assignedTo };
    onSubmit(computerData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-full">
      <div className="flex flex-wrap gap-4">
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя компьютера"
          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-1/4 text-black" // Установить ширину для каждого поля
        />
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-1/4"
        >
          {statuses.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <input 
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Отдел"
          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-1/4 text-black"
        />
        <input 
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Кому назначено"
          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-1/4 text-black"
        />
      </div>
      <textarea 
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Комментарий"
        className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full mt-4 mb-4 text-black"
      />
      <button 
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition duration-200"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ComputerForm;
