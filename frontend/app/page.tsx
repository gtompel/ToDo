'use client'
import { FC } from 'react';
import ComputerList from './components/ComputerList';
import { useState } from 'react';
import Login from './pages/login';

const Home: FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const handleLoginToggle = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">Управление компьютерами</h1>
            {/* Кнопка для показа/скрытия формы входа */}
            <button 
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleLoginToggle}
      >
        {showLogin ? 'Закрыть вход' : 'Вход'}
      </button>

      {/* Показываем форму входа, если состояние showLogin true  */}
      {showLogin && <Login />}
      <ComputerList />
    </div>
  );
};

export default Home;