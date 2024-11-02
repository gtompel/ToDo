'use client'
import { useState } from 'react';

interface ComputerInput {
  name: string;
  status: string;
  comment?: string;
  department?: string;
  assignedTo?: string;
}

interface ComputerFormProps {
  onSubmit: (data: ComputerInput) => void; // Указываем ComputerInput здесь
  initialData?: ComputerInput; // Указываем ComputerInput
  buttonText: string;
}

const statuses = ['Не назначен', 'ОЖИДАНИЕ', 'В РАБОТЕ', 'ВЫПОЛНЕНО'];

const ComputerForm: React.FC<ComputerFormProps> = ({ onSubmit, initialData, buttonText }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [status, setStatus] = useState(initialData?.status || 'Не назначен');
  const [comment, setComment] = useState(initialData?.comment || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');

  const handleSubmit = () => {
    const computerData = { name, status, comment, department, assignedTo };
    onSubmit(computerData); // Передаем без ID
    setName('');
    setStatus('Не назначен');
    setComment('');
    setDepartment('');
    setAssignedTo('');
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-full flex flex-wrap">
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Имя компьютера" 
        className="border rounded-lg p-2 m-2 flex-1"
      />
      <select 
        value={status} 
        onChange={(e) => setStatus(e.target.value)} 
        className="border rounded-lg p-2 m-2 flex-1"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      <input 
        type="text" 
        value={comment} 
        onChange={(e) => setComment(e.target.value)} 
        placeholder="Комментарий" 
        className="border rounded-lg p-2 m-2 flex-1"
      />
      <input 
        type="text" 
        value={department} 
        onChange={(e) => setDepartment(e.target.value)} 
        placeholder="Отдел" 
        className="border rounded-lg p-2 m-2 flex-1"
      />
      <input 
        type="text" 
        value={assignedTo} 
        onChange={(e) => setAssignedTo(e.target.value)} 
        placeholder="Кому назначено" 
        className="border rounded-lg p-2 m-2 flex-1"
      />
      <button 
        onClick={handleSubmit} 
        className="bg-blue-500 text-white rounded-lg p-2 m-2 flex-1"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ComputerForm;