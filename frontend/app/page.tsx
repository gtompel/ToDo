'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Computer {
  id: number;
  name: string;
  status: string;
}

const statuses = ['Не назначен', 'ОЖИДАНИЕ', 'В РАБОТЕ', 'ВЫПОЛНЕНО'];

export default function Home() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [name, setName] = useState('');

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

  const handleAddComputer = async () => {
    try {
      const response = await axios.post<Computer>('http://172.16.10.245:4200/computers', { name, status: 'Не назначен' });
      setComputers((prev) => [...prev, response.data]);
      setName('');
    } catch (error) {
      console.error("Ошибка при добавлении компьютера:", error);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.patch(`http://172.16.10.245:4200/computers/${id}`, { status: newStatus });
      setComputers((prev) => prev.map(comp => comp.id === id ? { ...comp, status: newStatus } : comp));
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Управление компьютерами</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Имя компьютера" 
          className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full mb-4 text-black"
        />
        <button 
          onClick={handleAddComputer}
          className="w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition duration-200"
        >
          Добавить компьютер
        </button>
      </div>
      <ul className="mt-6 w-full max-w-md">
        {computers.map((computer) => (
          <li key={computer.id} className="bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-black">{computer.name}</h2>
              <p className="text-gray-600">{computer.status}</p> {/* Здесь изменил на text-black */}
            </div>
            <div>
              {statuses.map((status) => (
                <button
                  key={status} 
                  onClick={() => handleUpdateStatus(computer.id, status)}
                  className={`ml-2 rounded-lg px-3 py-1 text-sm transition duration-200 ${
                    status === 'ОЖИДАНИЕ' ? 'bg-status-waiting hover:bg-yellow-500' :
                    status === 'В РАБОТЕ' ? 'bg-status-in-progress hover:bg-green-600' :
                    status === 'ВЫПОЛНЕНО' ? 'bg-status-completed hover:bg-red-600' :
                    'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
